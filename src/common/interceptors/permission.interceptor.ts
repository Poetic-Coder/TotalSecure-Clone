// import { SerializedTokenAccount } from '@common/interfaces';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException
} from '@nestjs/common';
import { Request } from 'express';
import { CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '@common/decorators/role.decorator';
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {

    const requiredPermission = this.reflector.get<string>(PERMISSIONS_KEY, context.getHandler());
    if (!requiredPermission) return false;

    const request = context.switchToHttp().getRequest<Request>();

    if (request['account'] == null) {
      throw new UnauthorizedException();
    }

   // const tokenAccount = request['account'] as SerializedTokenAccount;

    //if (!tokenAccount?.permission?.includes(requiredPermission) && !tokenAccount.isBusinessOwner) {
    //  throw new ForbiddenException('You do not have permission to perform this action');
   // }

    return true;
  }
}