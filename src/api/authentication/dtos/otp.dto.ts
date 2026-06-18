import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class OtpDto {
  @ApiProperty({ description: "User's otp" })
  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class OtpResponseDto {
  @ApiProperty({ description: 'Success message' })
  message: string;

  @ApiProperty({ description: 'Status' })
  status: boolean;
}
