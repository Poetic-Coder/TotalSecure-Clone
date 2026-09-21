import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { AnyUser, JwtPayloadData } from '@common/interfaces';
import { AccountType } from '@common/enums';
import { TokenType } from '@modules/security/security.interface';
import { PrismaService } from '@database/prisma.service';
import { SecurityService } from '@modules/security/security.service';

@Injectable()
export class AuthUserInterceptor implements NestInterceptor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly securityService: SecurityService,
  ) {}

  public async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header is missing or malformed.');
    }
    const token = authHeader.split(' ')[1];

    let payloadData: JwtPayloadData;
    try {
      payloadData = await this.securityService.verifyToken(
        token,
        TokenType.ACCESS, 
      );
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Invalid or expired token.');
    }

    const account = payloadData.account;
    if (!account || !account.id || !account.accountType) {
      throw new UnauthorizedException('Token payload is invalid.');
    }

    const userId = account.id;
    const accountType = account.accountType;
    let userEntity: AnyUser | null = null;

    switch (accountType) {
      case AccountType.STAFF:
        userEntity = await this.prisma.staff.findUnique({ where: { id: userId } });
        break;
      case AccountType.CLIENT:
        userEntity = await this.prisma.client.findUnique({ where: { id: userId } });
        break;
      case AccountType.GUARD:
        userEntity = await this.prisma.guard.findUnique({ where: { id: userId } });
        break;
      default:
        throw new UnauthorizedException('Invalid account type in token.');
    }

    if (!userEntity) {
      throw new UnauthorizedException('User associated with this token no longer exists.');
    }

    const companyId =
      account.companyId ??
      ('companyId' in userEntity ? (userEntity as { companyId?: string }).companyId : undefined);

    request.user = {
      ...userEntity,
      accountType,
      permissions: account.permissions ?? [],
      companyId,
    } as unknown as Express.Request['user'];

    return next.handle();
  }
}