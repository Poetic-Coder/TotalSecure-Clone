import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { JwtPayloadData } from '@common/interfaces';
import { TokenType } from '@modules/security/security.interface';
import { SecurityService } from '@modules/security/security.service';
import { AuthSessionService } from '@api/common/auth/services/auth-session.service';

@Injectable()
export class AuthUserInterceptor implements NestInterceptor {
  constructor(
    private readonly securityService: SecurityService,
    private readonly authSession: AuthSessionService,
  ) {}

  public async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Authorization header is missing or malformed.',
      );
    }

    let payloadData: JwtPayloadData;
    try {
      payloadData = await this.securityService.verifyToken(
        authHeader.split(' ')[1],
        TokenType.ACCESS,
      );
    } catch (error) {
      throw new UnauthorizedException(
        error.message || 'Invalid or expired token.',
      );
    }

    const account = payloadData.account;
    if (!account?.id || !account.accountType) {
      throw new UnauthorizedException('Token payload is invalid.');
    }

    request.user = await this.authSession.hydrateFromToken(account);
    request.jwtPayload = payloadData;
    return next.handle();
  }
}
