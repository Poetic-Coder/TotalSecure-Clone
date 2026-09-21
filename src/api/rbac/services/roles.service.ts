import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditAction, Permission, Role, Staff } from '@prisma/client';
import { PrismaService } from '@database/prisma.service';
import { CompanyPlanService } from './company-plan.service';
import { AuditLogService } from './audit-log.service';
import { PermissionResolverService } from './permission-resolver.service';
import { assertActorOwnsPermissions } from './rbac-policy';
import {
  CreateRoleDto,
  SetRolePermissionsDto,
  UpdateRoleDto,
} from '../dtos/rbac.dto';
import { randomUUID } from 'crypto';

type Actor = Staff & { companyId: string; companyPk: number };

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly planService: CompanyPlanService,
    private readonly auditLog: AuditLogService,
    private readonly resolver: PermissionResolverService,
  ) {}

  async listPermissions() {
    return this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        module: true,
        action: true,
        description: true,
      },
    });
  }

  async listRoles(companyId: string) {
    const roles = await this.prisma.role.findMany({
      where: {
        OR: [{ isSystem: true, companyPk: null }, { companyId }],
      },
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { staffUsingRole: true } },
      },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    });

    return roles.map((role) => this.serializeRole(role));
  }

  async getRole(roleId: string, companyId: string) {
    const role = await this.findAccessibleRole(roleId, companyId);
    return this.serializeRole(role);
  }

  async createCustomRole(actor: Actor, dto: CreateRoleDto) {
    await this.planService.assertCanUseCustomRoles(actor.companyId);

    const existing = await this.prisma.role.findFirst({
      where: { companyId: actor.companyId, name: dto.name },
    });
    if (existing) {
      throw new BadRequestException(`Role "${dto.name}" already exists for this company`);
    }

    const permissions = await this.resolvePermissionRecords(dto.permissions ?? []);
    await assertActorOwnsPermissions(
      this.resolver,
      actor.id,
      permissions.map((p) => p.name),
    );

    const role = await this.prisma.role.create({
      data: {
        name: dto.name,
        description: dto.description,
        isSystem: false,
        companyPk: actor.companyPk,
        companyId: actor.companyId,
        permissions: {
          create: permissions.map((p) => ({
            permissionPk: p.pk,
            permissionId: p.id,
          })),
        },
      },
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { staffUsingRole: true } },
      },
    });

    await this.auditLog.log({
      action: AuditAction.CREATE,
      module: 'ROLE',
      description: `Created custom role ${role.name}`,
      targetId: role.id,
      targetType: 'Role',
      companyPk: actor.companyPk,
      companyId: actor.companyId,
      staffPk: actor.pk,
      staffId: actor.id,
      metadata: { permissions: permissions.map((p) => p.name) },
    });

    return this.serializeRole(role);
  }

  async updateCustomRole(actor: Actor, roleId: string, dto: UpdateRoleDto) {
    const role = await this.requireCompanyCustomRole(roleId, actor.companyId);
    await this.planService.assertCanUseCustomRoles(actor.companyId);

    if (dto.name && dto.name !== role.name) {
      const clash = await this.prisma.role.findFirst({
        where: {
          companyId: actor.companyId,
          name: dto.name,
          NOT: { id: roleId },
        },
      });
      if (clash) {
        throw new BadRequestException(`Role "${dto.name}" already exists for this company`);
      }
    }

    const updated = await this.prisma.role.update({
      where: { id: roleId },
      data: {
        name: dto.name ?? undefined,
        description: dto.description ?? undefined,
      },
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { staffUsingRole: true } },
      },
    });

    await this.auditLog.log({
      action: AuditAction.UPDATE,
      module: 'ROLE',
      description: `Updated custom role ${updated.name}`,
      targetId: updated.id,
      targetType: 'Role',
      companyPk: actor.companyPk,
      companyId: actor.companyId,
      staffPk: actor.pk,
      staffId: actor.id,
    });

    return this.serializeRole(updated);
  }

  async deleteCustomRole(actor: Actor, roleId: string) {
    const role = await this.requireCompanyCustomRole(roleId, actor.companyId);
    await this.planService.assertCanUseCustomRoles(actor.companyId);

    const inUse = await this.prisma.staff.count({
      where: { customRoleId: roleId, companyId: actor.companyId },
    });
    if (inUse > 0) {
      throw new BadRequestException(
        `Cannot delete role "${role.name}" — ${inUse} staff member(s) are assigned to it`,
      );
    }

    await this.prisma.role.delete({ where: { id: roleId } });

    await this.auditLog.log({
      action: AuditAction.DELETE,
      module: 'ROLE',
      description: `Deleted custom role ${role.name}`,
      targetId: role.id,
      targetType: 'Role',
      companyPk: actor.companyPk,
      companyId: actor.companyId,
      staffPk: actor.pk,
      staffId: actor.id,
    });

    return { deleted: true, id: roleId };
  }

  async setRolePermissions(
    actor: Actor,
    roleId: string,
    dto: SetRolePermissionsDto,
  ) {
    const role = await this.requireCompanyCustomRole(roleId, actor.companyId);
    await this.planService.assertCanUseCustomRoles(actor.companyId);

    const permissions = await this.resolvePermissionRecords(dto.permissions);
    await assertActorOwnsPermissions(
      this.resolver,
      actor.id,
      permissions.map((p) => p.name),
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { rolePk: role.pk } });
      if (permissions.length > 0) {
        await tx.rolePermission.createMany({
          data: permissions.map((p) => ({
            id: randomUUID(),
            rolePk: role.pk,
            roleId: role.id,
            permissionPk: p.pk,
            permissionId: p.id,
          })),
        });
      }
    });

    const updated = await this.findAccessibleRole(roleId, actor.companyId);

    await this.auditLog.log({
      action: AuditAction.PERMISSION_CHANGE,
      module: 'ROLE',
      description: `Updated permissions for role ${role.name}`,
      targetId: role.id,
      targetType: 'Role',
      companyPk: actor.companyPk,
      companyId: actor.companyId,
      staffPk: actor.pk,
      staffId: actor.id,
      metadata: { permissions: permissions.map((p) => p.name) },
    });

    return this.serializeRole(updated);
  }

  private async requireCompanyCustomRole(roleId: string, companyId: string) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    if (role.isSystem || role.companyId !== companyId) {
      throw new ForbiddenException('System roles are read-only; only custom company roles can be modified');
    }
    return role;
  }

  private async findAccessibleRole(roleId: string, companyId: string) {
    const role = await this.prisma.role.findFirst({
      where: {
        id: roleId,
        OR: [{ isSystem: true, companyPk: null }, { companyId }],
      },
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { staffUsingRole: true } },
      },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  private async resolvePermissionRecords(names: string[]): Promise<Permission[]> {
    const unique = [...new Set(names)];
    if (unique.length === 0) return [];

    const found = await this.prisma.permission.findMany({
      where: { name: { in: unique } },
    });
    if (found.length !== unique.length) {
      const foundNames = new Set(found.map((p) => p.name));
      const missing = unique.filter((n) => !foundNames.has(n));
      throw new BadRequestException(`Unknown permission(s): ${missing.join(', ')}`);
    }
    return found;
  }

  private serializeRole(
    role: Role & {
      permissions: { permission: Permission }[];
      _count?: { staffUsingRole: number };
    },
  ) {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      companyId: role.companyId,
      permissions: role.permissions.map((rp) => rp.permission.name).sort(),
      staffCount: role._count?.staffUsingRole ?? undefined,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }
}
