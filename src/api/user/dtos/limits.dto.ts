import { ApiResponseProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class AccountLimitDto {
  @Exclude()
  id: string;

  @Exclude()
  pk: number;

  @Exclude()
  ref: string;

  @ApiResponseProperty({
    example: 'Tier 1'
  })
  name: string;

  @ApiResponseProperty()
  dailyWithdrawalLimit: number;

  @ApiResponseProperty()
  dailyTransferLimit: number;

  @ApiResponseProperty()
  dailyDepositLimit: number;

  constructor(data: Partial<AccountLimitDto>) {
    Object.assign(this, data);
  }
}
