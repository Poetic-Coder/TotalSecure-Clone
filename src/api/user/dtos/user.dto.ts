import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { ProfileDto } from './profile.dto';


export class UserProfileDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  email: string

  @ApiProperty()
  phone: string

  @ApiProperty({
    type: ProfileDto,
  })
  profile: ProfileDto

  @ApiProperty()
  @IsBoolean()
  emailVerified: boolean

  @ApiProperty()
  @IsBoolean()
  phoneVerified: boolean

  @ApiProperty()
  @IsBoolean()
  staff: boolean

  @ApiProperty()
  @IsBoolean()
  admin: boolean
}

export class UserDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  email: string

  @ApiProperty()
  @IsBoolean()
  emailVerified: boolean

  @ApiProperty()
  @IsBoolean()
  staff: boolean

  @ApiProperty()
  @IsBoolean()
  admin: boolean
}

export class RegisterFingerprintDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  accountNumber: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  pin: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  fingerprintData: string;
}

