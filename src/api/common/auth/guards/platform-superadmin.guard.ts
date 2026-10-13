import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AccountType } from '@common/enums';
import { AuthenticatedRequestUser } from '@common/interfaces';
import { PlatformStaff, PlatformStaffRole } from '@prisma/client';

@Injectable()
export class PlatformSuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as
      | (AuthenticatedRequestUser & PlatformStaff)
      | undefined;

    if (!user || user.accountType !== AccountType.PLATFORM_STAFF) {
      throw new ForbiddenException('Platform staff access required');
    }

    if (user.role !== PlatformStaffRole.PLATFORM_SUPER_ADMIN) {
      throw new ForbiddenException('Platform super admin access required');
    }

    return true;
  }
}
