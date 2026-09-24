import { Injectable } from '@nestjs/common';
import { PermissionEffect, Staff, StaffRole } from '@prisma/client';
import { PrismaService } from '@database/prisma.service';

export type EffectivePermissionBreakdown = {
  base: string[];
  grants: string[];
  denies: string[];
  effective: string[];
  roleName: string | null;
  companyId: string;
};

@Injectable()
export class PermissionResolverService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * effective = (role permissions − DENY) ∪ GRANT
   */
  async resolveForStaff(staffId: string): Promise<EffectivePermissionBreakdown> {
    const staff = await this.prisma.staff.findUnique({
      where: { id: staffId },
      include: {
        customRole: {
          include: {
            permissions: { include: { permission: true } },
          },
        },
        permissionOverrides: {
          include: { permission: true },
        },
      },
    });

    if (!staff) {
      return {
        base: [],
        grants: [],
        denies: [],
        effective: [],
        roleName: null,
        companyId: '',
      };
    }

    const base = await this.resolveBasePermissions(staff);
    const grants: string[] = [];
    const denies: string[] = [];

    for (const override of staff.permissionOverrides) {
      if (override.effect === PermissionEffect.GRANT) {
        grants.push(override.permission.name);
      } else if (override.effect === PermissionEffect.DENY) {
        denies.push(override.permission.name);
      }
    }

    const denySet = new Set(denies);
    const effectiveSet = new Set(base.filter((p) => !denySet.has(p)));
    for (const g of grants) {
      effectiveSet.add(g);
    }

    const roleName = staff.customRole?.name ?? staff.role;

    return {
      base: [...base].sort(),
      grants: [...new Set(grants)].sort(),
      denies: [...new Set(denies)].sort(),
      effective: [...effectiveSet].sort(),
      roleName,
      companyId: staff.companyId,
    };
  }

  async getEffectivePermissionNames(staffId: string): Promise<string[]> {
    const result = await this.resolveForStaff(staffId);
    return result.effective;
  }

  private async resolveBasePermissions(
    staff: Staff & {
      customRole: {
        name: string;
        permissions: { permission: { name: string } }[];
      } | null;
    },
  ): Promise<string[]> {
    if (staff.customRole) {
      return staff.customRole.permissions.map((rp) => rp.permission.name);
    }

    return this.getSystemRolePermissions(staff.role);
  }

  private async getSystemRolePermissions(staffRole: StaffRole): Promise<string[]> {
    const role = await this.prisma.role.findFirst({
      where: {
        name: staffRole,
        isSystem: true,
        companyPk: null,
      },
      include: {
        permissions: { include: { permission: true } },
      },
    });

    if (!role) {
      return [];
    }

    return role.permissions.map((rp) => rp.permission.name);
  }
}
