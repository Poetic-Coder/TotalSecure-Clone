import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
  } from '@nestjs/common';
  import { AnyUser } from '@common/interfaces';
  import { AccountType } from '@common/enums';
  
  @Injectable()
  export class ApiKeyUserGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
      
      const apiKeyUser = request.apiKeyUser as AnyUser & { accountType: AccountType };
      
      const authenticatedUser = request.user as AnyUser & { accountType: AccountType };
  
      if (!apiKeyUser || !authenticatedUser) {
        throw new UnauthorizedException(
          'Both API key and authentication are required'
        );
      }
  
      const apiKeyUserType = apiKeyUser.accountType;
      const authenticatedUserType = authenticatedUser.accountType;
  

      if (apiKeyUserType !== authenticatedUserType) {
        throw new UnauthorizedException(
          `API key type mismatch. You are logged in as ${authenticatedUserType} ` +
          `but using a ${apiKeyUserType} API key. Please use your own ${authenticatedUserType} API key.`
        );
      }
  
      return true;
    }
  }