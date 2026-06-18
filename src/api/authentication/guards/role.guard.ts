import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AnyUser, JwtPayloadData } from '@common/interfaces';
import { AccountType } from '@common/enums';

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredAccountTypes = this.reflector.getAllAndOverride<AccountType[]>(
      ROLES_KEY,
      [context.getHandler(),
      context.getClass()],
    );

    if (!requiredAccountTypes) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const userWithRole = user as AnyUser & { accountType: AccountType };

    if (!userWithRole || !userWithRole.accountType) {
        return false;
    }
    const hasPermission = requiredAccountTypes.some(
      (type) => userWithRole.accountType === type,
    );

    if (!hasPermission) {
      throw new ForbiddenException('You do not have the required account type to access this resource.');
    }

    return true;
  }
}