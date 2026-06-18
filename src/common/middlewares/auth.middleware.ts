
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { Request, Response, NextFunction } from 'express';
import { TokenType } from '@modules/security/security.interface';
import { SecurityService } from '@modules/security/security.service';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
    }
  }
}


/**
 * This middleware checks if the user is authenticated with a valid token.
 */
@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  private logger = new Logger(AuthenticationMiddleware.name);

  constructor(private readonly securityService: SecurityService) {}

  public async use(req: Request, res: Response, next: NextFunction) {
    try {
      if(req.path.includes('/static') || req.path.includes('/queues')){
        next();
        return
      }
      const headers = req.headers;

      if (headers['authorization']) {
        // Get the token from the headers
        const token = headers['authorization'].split(' ')[1];

        // Verifies secret and checks exp
        if (token) {
          // Try to decode the token and get the user info if it's valid
          const payload = await this.securityService.verifyToken(
            token,
            TokenType.ACCESS,
          );

          if (payload) {
        
            return next();
          }
        }
      }

      throw new UnauthorizedException(
        'You must be logged in to access this resource',
      );
    } catch (error) {
      this.logger.error(error);

      return res.status(401).json({
        statusCode: 401,
        message: error.message,
      });
    }
  }
}
