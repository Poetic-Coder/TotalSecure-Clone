
import { AccountType } from '@common/enums';
import { Agent, Staff, Customer } from '@prisma/client';
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
  roles?: string[];       
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

export type AnyUser = Staff | Agent | Customer;