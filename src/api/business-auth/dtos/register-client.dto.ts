import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  Matches
} from 'class-validator';
import { ClientType } from '@prisma/client';

export class RegisterClientDto {
  @ApiProperty({ example: 'GTBank Nigeria' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'security@gtbank.ng' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+2348033333333' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+234[0-9]{10}$/, {
    message: 'Phone number must be in Nigerian international format e.g. +2348012345678',
  })
  phone: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ enum: ClientType, default: ClientType.ORGANIZATION })
  @IsEnum(ClientType)
  @IsOptional()
  clientType?: ClientType;

  @ApiProperty({ example: 'Lagos' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ example: 'Lagos' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ example: 'Nigeria' })
  @IsString()
  @IsOptional()
  country?: string;
}