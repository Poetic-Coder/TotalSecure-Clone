import { SetMetadata } from '@nestjs/common';

export const AUTH_RATE_LIMIT_KEY = 'auth_rate_limit';

export type AuthRateLimitOptions = {
  /** Unique bucket name, e.g. login / register */
  key: string;
  /** Max requests in the window */
  points: number;
  /** Window length in seconds */
  durationSec: number;
};

export const AuthRateLimit = (options: AuthRateLimitOptions) =>
  SetMetadata(AUTH_RATE_LIMIT_KEY, options);
