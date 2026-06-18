import { ApiProperty } from '@nestjs/swagger';
import { VerificationStatus } from '@prisma/client';
import { IsBoolean, IsEnum, IsString, IsUrl } from 'class-validator';


export class CustomerProfileDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  firstName: string

  @ApiProperty()
  lastName: string

  @ApiProperty({
    type: 'string',
    enum: VerificationStatus,
  })
  @IsString()
  idVerified: VerificationStatus

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