import { API_HEADER_KEY } from '@common/constants';
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ApiKeyService } from '@api/apikey/apiKey.service';
import { AnyUser } from '@common/interfaces';
import { AccountType } from '@common/enums';

declare global {
  namespace Express {
    interface Request {
      apiKeyUser?: AnyUser & { accountType: AccountType };
      user?: AnyUser & { accountType: AccountType };
    }
  }
}

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (req.path.includes('/static') || req.path.includes('/queues')) {
      return next();
    }

    const key = req.headers[API_HEADER_KEY] as string;
    if (!key) {
      throw new UnauthorizedException('API Key is required');
    }

    const validationResult = await this.apiKeyService.validateKey(key);
    if (!validationResult) {
      throw new UnauthorizedException('Invalid or inactive API key');
    }

    req.apiKeyUser = {
      ...validationResult.user,
      accountType: validationResult.accountType,
    };
    req.user = req.apiKeyUser;

    next();
  }
}