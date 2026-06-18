import { ProfileDto } from '@api/user/dtos/profile.dto';
import { StaffProfileDto } from '@api/user/dtos/staff-profile.dto';
import { AgentProfileDto } from '@api/user/dtos/agent-profile.dto';
import { getSchemaPath, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class DeviceDataDTO {
  @ApiProperty({ description: 'Device Operating System' })
  @IsString()
  deviceOS: string;

  @ApiProperty({ description: 'Device Type' })
  @IsString()
  deviceType: string;

  @ApiProperty({ description: 'Device Token' })
  @IsString()
  @IsOptional()
  deviceToken: string;

  @ApiProperty({ description: 'Device ID' })
  @IsString()
  deviceID: string;
}



export class LoginDto {
  @ApiProperty({ description: "User's phone" })
  @IsPhoneNumber('NG')
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: "User's password" })
  @IsString()
  @IsNotEmpty()
  password: any;

  @ApiProperty({ description: "User type" })
  @IsString()
  @IsOptional()
  slug: string;
}

export class LoginResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(ProfileDto) },
      { $ref: getSchemaPath(StaffProfileDto) },
      { $ref: getSchemaPath(AgentProfileDto) }
    ],
    description: 'Can be a customer, staff, or agent profile DTO'
  })
  profile: ProfileDto | StaffProfileDto | AgentProfileDto;

  @ApiProperty()
  @IsBoolean()
  emailVerified: boolean;

  @ApiProperty()
  @IsBoolean()
  phoneVerified: boolean;
}
