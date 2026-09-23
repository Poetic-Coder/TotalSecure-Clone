import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccountType } from '@common/enums';
import { CLIENT_ROLES_KEY } from '../decorators/client-roles.decorator';

@Injectable()
export class ClientRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      CLIENT_ROLES_KEY,
      context.getHandler(),
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (
      user.accountType === AccountType.COMPANY ||
      user.accountType === AccountType.PLATFORM_STAFF
    ) {
      return true;
    }

// CLIENT account itself has no role restriction
if (user.accountType === AccountType.CLIENT) {
  return true;
}

    if (!requiredRoles.includes(user.clientRole)) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}