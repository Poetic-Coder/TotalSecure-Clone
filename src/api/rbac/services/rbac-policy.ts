import { ForbiddenException } from '@nestjs/common';
import { Staff } from '@prisma/client';
import { PermissionResolverService } from './permission-resolver.service';

export type StaffActor = Staff & {
  companyId: string;
  companyPk: number;
  permissions?: string[];
  accountType?: string;
};

/**
 * Actor may only attach permissions they themselves hold (prevents privilege escalation).
 */
export async function assertActorOwnsPermissions(
  resolver: PermissionResolverService,
  actorId: string,
  permissionNames: string[],
) {
  if (permissionNames.length === 0) return;

  const { effective } = await resolver.resolveForStaff(actorId);
  const owned = new Set(effective);
  const missing = [...new Set(permissionNames)].filter((p) => !owned.has(p));

  if (missing.length > 0) {
    throw new ForbiddenException(
      `You cannot assign permission(s) you do not have: ${missing.join(', ')}`,
    );
  }
}
