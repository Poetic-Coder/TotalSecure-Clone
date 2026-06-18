import { DynamicObject } from '@common/interfaces';
import { TokenAccount } from '@common/interfaces';


export type TokenData = {
  tokenType: TokenType;
  account: TokenAccount; 
};

export enum TokenType {
  RESET_PASSWORD = 'RESET_PASSWORD',
  ACCESS = 'ACCESS',
}

export interface GenerateTokenArgs {
  /** expressed in seconds or a string describing a time span [zeit/ms](https://github.com/zeit/ms.js).  Eg: 60, "2 days", "10h", "7d" */
  expiresIn?: string | number;

  data: TokenData;
}
