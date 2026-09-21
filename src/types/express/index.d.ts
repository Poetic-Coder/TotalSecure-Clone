import { AnyUser } from '@common/interfaces';
import { AccountType } from '@common/enums';

declare global {
  namespace Express {
    export interface Request {
      user?: AnyUser & {
        accountType: AccountType;
        permissions?: string[];
        companyId?: string;
      };

      apiKeyUser?: AnyUser & { accountType: AccountType };

      jwtPayload?: any;
    }
  }
}

export {};
