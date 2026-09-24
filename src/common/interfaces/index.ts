import { AccountType } from '@common/enums';
import {
  Client,
  ClientStaff,
  Company,
  Guard,
  PlatformStaff,
  Staff,
} from '@prisma/client';
import { TokenType } from '@modules/security/security.interface';

export type DynamicObject = { [name: string]: any };

export enum Role {
  Admin = 'Admin',
  Staff = 'Staff',
  Active = 'Active',
}

export type APP_ENV = 'development' | 'production';

export interface TokenAccount {
  id: string;
  accountType: AccountType;
  email: string;
  role?: string;
  companyId?: string;
  permissions?: string[];
  guardStatus?: string;
  clientType?: string;
  clientId?: string;
  clientRole?: string;
  impersonatedBy?: string;
}

export interface JwtPayloadData {
  tokenType: TokenType;
  account: TokenAccount;
}

export interface DecodedJwt {
  data: JwtPayloadData;
  iat: number;
  exp: number;
}

export type AnyUser =
  | Staff
  | Client
  | Guard
  | Company
  | PlatformStaff
  | ClientStaff;

export type AuthenticatedRequestUser = AnyUser & {
  accountType: AccountType;
  permissions?: string[];
  companyId?: string;
  clientId?: string;
  impersonatedBy?: string;
};
