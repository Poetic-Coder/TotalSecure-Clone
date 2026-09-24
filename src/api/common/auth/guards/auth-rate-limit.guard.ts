import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import {
  AUTH_RATE_LIMIT_KEY,
  AuthRateLimitOptions,
} from '../decorators/auth-rate-limit.decorator';

@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  private readonly limiters = new Map<string, RateLimiterMemory>();

  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.getAllAndOverride<AuthRateLimitOptions>(
      AUTH_RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!options) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const ip =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      request.ip ||
      request.connection?.remoteAddress ||
      'unknown';

    // IP-based buckets stop register/login floods; per-email lockout still
    // lives in AuthAccountService for credential stuffing.
    const limiter = this.getLimiter(options);
    try {
      await limiter.consume(`${options.key}:${ip}`);
      return true;
    } catch {
      throw new HttpException(
        'Too many requests. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private getLimiter(options: AuthRateLimitOptions) {
    const cacheKey = `${options.key}:${options.points}:${options.durationSec}`;
    let limiter = this.limiters.get(cacheKey);
    if (!limiter) {
      limiter = new RateLimiterMemory({
        points: options.points,
        duration: options.durationSec,
      });
      this.limiters.set(cacheKey, limiter);
    }
    return limiter;
  }
}
