import { ApiProperty } from '@nestjs/swagger';
import { VerificationStatus } from '@prisma/client';
import { IsBoolean, IsEnum, IsString, IsUrl } from 'class-validator';


export class AgentProfileDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  firstName: string

  @ApiProperty()
  lastName: string
}

export class AuthPinDto {
  @ApiProperty()
  @IsString()
  authPin: string;
}

export class PhotoUploadDto {
  @ApiProperty()
  @IsUrl()
  photo: string;
}

export class UpdateProfileDto {
  @ApiProperty()
  @IsString()
  nextOfKin: string

  @ApiProperty()
  @IsString()
  maritalStatus: string
}