import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { SecurityService } from '@modules/security/security.service';
import { TokenType } from '@modules/security/security.interface';
import { AccountType } from '@common/enums';

@Injectable()
export class BusinessAuthGuard implements CanActivate {
  constructor(private readonly securityService: SecurityService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = await this.securityService.verifyToken(
        token,
        TokenType.ACCESS,
      );

      const businessTypes = [
        AccountType.COMPANY,
        AccountType.CLIENT,
        AccountType.CLIENT_STAFF,
      ];

      if (!businessTypes.includes(payload.account.accountType)) {
        throw new UnauthorizedException('Invalid token for this resource');
      }

      request.user = payload.account;
      return true;
    } catch (error) {
      throw new UnauthorizedException(
        error || 'Invalid or expired token',
      );
    }
  }
}