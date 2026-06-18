import { API_HEADER_KEY } from '@common/constants';
import { HashingService } from '@modules/hashing/hashing.service';
import { Injectable } from '@nestjs/common/decorators';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { NestMiddleware } from '@nestjs/common/interfaces';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction as Next } from 'express';

@Injectable()
export class ExternalMiddleware implements NestMiddleware {
  constructor(
    private readonly configService: ConfigService,
    private readonly hashingService: HashingService,
  ) {}

  async use(req: Request, res: Response, next: Next) {
    if (req.headers[API_HEADER_KEY]) {
      const key = req.headers[API_HEADER_KEY] as string;

      let apiKeyConst = 'EXTERNAL_API_KEY';
      if((req.originalUrl).indexOf("cvas") > 0)
          apiKeyConst = 'EXTERNAL_API_KEY_CVAS'

      // API key can be generate using `yarn generate:generateSecureKey`
       const apiKey = this.configService.get<string>(apiKeyConst);
       const valid = await this.hashingService.compare(key, apiKey);


      if (valid) {
        next();
        return;
      }
    }
    throw new UnauthorizedException('Provide a valid API KEY');
  }
}
