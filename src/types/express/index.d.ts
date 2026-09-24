import { AuthenticatedRequestUser } from '@common/interfaces';
import { AccountType } from '@common/enums';
import { AnyUser } from '@common/interfaces';

declare global {
  namespace Express {
    export interface Request {
      user?: AuthenticatedRequestUser;
      apiKeyUser?: AnyUser & { accountType: AccountType };
      jwtPayload?: any;
    }
  }
}

export {};
