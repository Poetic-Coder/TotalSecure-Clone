
import { API_HEADER_KEY, X_API_USER } from '@common/constants';
import { Injectable } from '@nestjs/common/decorators';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { NestMiddleware } from '@nestjs/common/interfaces';
import { Request, Response, NextFunction as Next } from 'express';
import { ApiKeyService } from '@api/apikey/apiKey.service';
import { AnyUser } from '@common/interfaces';
import { AccountType } from '@common/enums';


declare global {
  namespace Express {
    interface Request {
      user?: AnyUser & { accountType: AccountType };
    }
  }
}

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  constructor(private readonly apiKeyService: ApiKeyService) { }

  async use(req: Request, res: Response, next: Next) {
    if(req.path.includes('/static') || req.path.includes('/queues')){
      next();
      return
    }

    if (!req.headers[API_HEADER_KEY]) {
      throw new UnauthorizedException('API Key is required');
    }

    const key = req.headers[API_HEADER_KEY] as string;

    const validationResult = await this.apiKeyService.validateKey(key);

    if (!validationResult) {
      throw new UnauthorizedException('Invalid or inactive API key.');
    }

   
    req.apiKeyUser = {
      ...validationResult.user,
      accountType: validationResult.accountType,
    };

    req.user = req.apiKeyUser;

    next();
  }
}
