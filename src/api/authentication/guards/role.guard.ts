import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayloadData } from '@common/interfaces';
import { AccountType } from '@common/enums';
import { SecurityService } from '@modules/security/security.service';
import { TokenType } from '@modules/security/security.interface';
import { Request } from 'express';

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly securityService: SecurityService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredAccountTypes = this.reflector.getAllAndOverride<AccountType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredAccountTypes || requiredAccountTypes.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    let accountType =
      (request.user as { accountType?: AccountType } | undefined)?.accountType;

    if (!accountType) {
      const authHeader = request.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        throw new UnauthorizedException(
          'Authorization header is missing or malformed.',
        );
      }

      let payload: JwtPayloadData;
      try {
        payload = await this.securityService.verifyToken(
          authHeader.split(' ')[1],
          TokenType.ACCESS,
        );
      } catch (error) {
        throw new UnauthorizedException(
          error?.message || 'Invalid or expired token.',
        );
      }

      accountType = payload.account?.accountType;
    }

    if (!accountType) {
      throw new ForbiddenException(
        'You do not have the required account type to access this resource.',
      );
    }

    const allowed = requiredAccountTypes.some((type) => accountType === type);
    if (!allowed) {
      throw new ForbiddenException(
        'You do not have the required account type to access this resource.',
      );
    }

    return true;
  }
}
