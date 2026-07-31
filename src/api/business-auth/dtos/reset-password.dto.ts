import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { IsEmailOrPhone } from '@common/validators/is-email-phone';

export class ResetPasswordDto {
  @ApiProperty({ example: 'security@gtbank.ng', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '+2348033333333', required: false })
  @IsString()
  @IsOptional()
  @Matches(/^\+234[0-9]{10}$/, {
    message: 'Phone number must be a valid Nigerian number e.g. +2348012345678',
  })
  @IsEmailOrPhone()
  phone?: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;

  @ApiProperty({ example: 'NewPassword123!' })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}