import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PERMISSIONS_KEY } from '@common/decorators/role.decorator';
import { SecurityService } from '@modules/security/security.service';
import { TokenType } from '@modules/security/security.interface';
import { JwtPayloadData } from '@common/interfaces';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly securityService: SecurityService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    // Prefer permissions already attached (e.g. by middleware); else read JWT
    let permissions: string[] | undefined = (
      request.user as { permissions?: string[] } | undefined
    )?.permissions;

    if (!permissions) {
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

      permissions = payload.account?.permissions ?? [];
    }

    const owned = new Set(permissions);
    const missing = required.filter((p) => !owned.has(p));

    if (missing.length > 0) {
      throw new ForbiddenException(
        `Missing permission(s): ${missing.join(', ')}`,
      );
    }

    return true;
  }
}
