import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AuditAction,
  ActiveStatus,
  Permission,
  PermissionEffect,
  Staff,
  StaffRole,
} from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '@database/prisma.service';
import { PermissionResolverService } from './permission-resolver.service';
import { AuditLogService } from './audit-log.service';
import { CompanyPlanService } from './company-plan.service';
import { assertActorOwnsPermissions } from './rbac-policy';
import {
  AssignStaffRoleDto,
  SetStaffPermissionOverridesDto,
} from '../dtos/rbac.dto';

type Actor = Staff & { companyId: string; companyPk: number };

const ADMIN_PERMS = ['role:manage', 'staff:assign_role'] as const;

@Injectable()
export class StaffRbacService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly resolver: PermissionResolverService,
    private readonly auditLog: AuditLogService,
    private readonly planService: CompanyPlanService,
  ) {}

  async getStaffPermissions(actor: Actor, staffId: string) {
    const staff = await this.requireSameCompanyStaff(staffId, actor.companyId);
    const breakdown = await this.resolver.resolveForStaff(staff.id);
    return {
      staffId: staff.id,
      staffRole: staff.role,
      customRoleId: staff.customRoleId,
      ...breakdown,
    };
  }

  async assignRole(actor: Actor, staffId: string, dto: AssignStaffRoleDto) {
    if (dto.staffRole === undefined && dto.customRoleId === undefined) {
      throw new BadRequestException('Provide staffRole and/or customRoleId');
    }

    const staff = await this.requireSameCompanyStaff(staffId, actor.companyId);

    let nextStaffRole = staff.role;
    let nextCustomRoleId: string | null =
      dto.customRoleId === undefined ? staff.customRoleId : null;
    let nextCustomRolePk: number | null =
      dto.customRoleId === undefined ? staff.customRolePk : null;

    if (dto.staffRole !== undefined) {
      nextStaffRole = dto.staffRole;
    }

    if (dto.customRoleId !== undefined) {
      if (dto.customRoleId === null) {
        nextCustomRoleId = null;
        nextCustomRolePk = null;
      } else {
        const role = await this.prisma.role.findFirst({
          where: {
            id: dto.customRoleId,
            OR: [
              { isSystem: true, companyPk: null },
              { companyId: actor.companyId },
            ],
          },
        });
        if (!role) {
          throw new NotFoundException('Role not found for this company');
        }
        nextCustomRoleId = role.id;
        nextCustomRolePk = role.pk;

        if (!role.isSystem) {
          await this.planService.assertCanUseCustomRoles(actor.companyId);
        }

        if (
          role.isSystem &&
          Object.values(StaffRole).includes(role.name as StaffRole)
        ) {
          nextStaffRole = role.name as StaffRole;
        }
      }
    }

    const previewBase = await this.resolveBaseFor(
      nextStaffRole,
      nextCustomRoleId,
    );
    const current = await this.resolver.resolveForStaff(staff.id);
    const previewEffective = this.applyOverrides(
      previewBase,
      current.grants,
      current.denies,
    );

    await this.assertCompanyKeepsAdminAccess(
      actor.companyId,
      staff.id,
      previewEffective,
    );

    const updated = await this.prisma.staff.update({
      where: { id: staff.id },
      data: {
        role: nextStaffRole,
        customRolePk: nextCustomRolePk,
        customRoleId: nextCustomRoleId,
      },
      include: {
        customRole: true,
        profile: true,
      },
    });

    const breakdown = await this.resolver.resolveForStaff(updated.id);

    await this.auditLog.log({
      action: AuditAction.PERMISSION_CHANGE,
      module: 'STAFF',
      description: `Assigned role for staff ${updated.email}`,
      targetId: updated.id,
      targetType: 'Staff',
      companyPk: actor.companyPk,
      companyId: actor.companyId,
      staffPk: actor.pk,
      staffId: actor.id,
      metadata: {
        staffRole: updated.role,
        customRoleId: updated.customRoleId,
        effective: breakdown.effective,
      },
    });

    return {
      staffId: updated.id,
      staffRole: updated.role,
      customRoleId: updated.customRoleId,
      ...breakdown,
    };
  }

  async setPermissionOverrides(
    actor: Actor,
    staffId: string,
    dto: SetStaffPermissionOverridesDto,
  ) {
    const staff = await this.requireSameCompanyStaff(staffId, actor.companyId);

    const byName = new Map<string, PermissionEffect>();
    for (const item of dto.overrides) {
      byName.set(item.permission, item.effect);
    }

    const names = [...byName.keys()];
    const permissions = await this.resolvePermissions(names);
    const permByName = new Map(permissions.map((p) => [p.name, p]));

    const grants = [...byName.entries()]
      .filter(([, effect]) => effect === PermissionEffect.GRANT)
      .map(([name]) => name);
    const denies = [...byName.entries()]
      .filter(([, effect]) => effect === PermissionEffect.DENY)
      .map(([name]) => name);

    await assertActorOwnsPermissions(this.resolver, actor.id, grants);

    const preview = await this.resolver.resolveForStaff(staff.id);
    const previewEffective = this.applyOverrides(preview.base, grants, denies);

    await this.assertCompanyKeepsAdminAccess(
      actor.companyId,
      staff.id,
      previewEffective,
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.staffPermission.deleteMany({ where: { staffPk: staff.pk } });

      for (const [name, effect] of byName) {
        const permission = permByName.get(name);
        if (!permission) continue;
        await tx.staffPermission.create({
          data: {
            id: randomUUID(),
            effect,
            staffPk: staff.pk,
            staffId: staff.id,
            permissionPk: permission.pk,
            permissionId: permission.id,
          },
        });
      }
    });

    const breakdown = await this.resolver.resolveForStaff(staff.id);

    await this.auditLog.log({
      action: AuditAction.PERMISSION_CHANGE,
      module: 'STAFF',
      description: `Updated permission overrides for staff ${staff.email}`,
      targetId: staff.id,
      targetType: 'Staff',
      companyPk: actor.companyPk,
      companyId: actor.companyId,
      staffPk: actor.pk,
      staffId: actor.id,
      metadata: {
        grants: breakdown.grants,
        denies: breakdown.denies,
        effective: breakdown.effective,
      },
    });

    return {
      staffId: staff.id,
      staffRole: staff.role,
      customRoleId: staff.customRoleId,
      ...breakdown,
    };
  }

  private applyOverrides(
    base: string[],
    grants: string[],
    denies: string[],
  ): string[] {
    const denySet = new Set(denies);
    const effective = new Set(base.filter((p) => !denySet.has(p)));
    for (const g of grants) {
      effective.add(g);
    }
    return [...effective];
  }

  private async resolveBaseFor(
    staffRole: StaffRole,
    customRoleId: string | null,
  ): Promise<string[]> {
    if (customRoleId) {
      const role = await this.prisma.role.findUnique({
        where: { id: customRoleId },
        include: { permissions: { include: { permission: true } } },
      });
      return role?.permissions.map((rp) => rp.permission.name) ?? [];
    }

    const role = await this.prisma.role.findFirst({
      where: { name: staffRole, isSystem: true, companyPk: null },
      include: { permissions: { include: { permission: true } } },
    });
    return role?.permissions.map((rp) => rp.permission.name) ?? [];
  }

  private hasAdminAccess(perms: string[]) {
    return ADMIN_PERMS.some((p) => perms.includes(p));
  }

  /**
   * Company must retain at least one active staff who can manage roles / assign access.
   */
  private async assertCompanyKeepsAdminAccess(
    companyId: string,
    changedStaffId: string,
    changedStaffEffective: string[],
  ) {
    if (this.hasAdminAccess(changedStaffEffective)) {
      return;
    }

    const others = await this.prisma.staff.findMany({
      where: {
        companyId,
        id: { not: changedStaffId },
        active: ActiveStatus.ACTIVE,
      },
      select: { id: true },
    });

    for (const other of others) {
      const effective = await this.resolver.getEffectivePermissionNames(other.id);
      if (this.hasAdminAccess(effective)) {
        return;
      }
    }

    throw new ForbiddenException(
      'Cannot leave the company without at least one staff member who can manage roles',
    );
  }

  private async requireSameCompanyStaff(staffId: string, companyId: string) {
    const staff = await this.prisma.staff.findUnique({ where: { id: staffId } });
    if (!staff) {
      throw new NotFoundException('Staff not found');
    }
    if (staff.companyId !== companyId) {
      throw new ForbiddenException('Staff does not belong to your company');
    }
    return staff;
  }

  private async resolvePermissions(names: string[]): Promise<Permission[]> {
    if (names.length === 0) return [];
    const found = await this.prisma.permission.findMany({
      where: { name: { in: names } },
    });
    if (found.length !== names.length) {
      const foundNames = new Set(found.map((p) => p.name));
      const missing = names.filter((n) => !foundNames.has(n));
      throw new BadRequestException(
        `Unknown permission(s): ${missing.join(', ')}`,
      );
    }
    return found;
  }
}
