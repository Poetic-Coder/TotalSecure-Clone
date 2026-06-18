import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class SmsEmailDto {
    @ApiProperty()
    @IsOptional()
    userId: string
  
    @ApiProperty()
    content: string

    @ApiProperty()
    @IsOptional()
    subject: string
  
    @ApiProperty()
    @IsBoolean()
    isSms: boolean

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    isBroadCastSms: boolean

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    isBroadCastEmail: boolean
  
    @ApiProperty()
    @IsBoolean()
    isEmail: boolean

  }