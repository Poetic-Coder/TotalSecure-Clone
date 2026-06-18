import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { isMatch } from '@common/validators/match_field';
import { Type } from 'class-transformer';

class DeviceData {
  @ApiProperty({ description: 'Device Operating System' })
  @IsString()
  deviceOS: string;

  @ApiProperty({ description: 'Device Type' })
  @IsString()
  deviceType: string;

  @ApiProperty({ description: 'Device Token' })
  @IsString()
  deviceToken: string;

  @ApiProperty({ description: 'Device ID' })
  @IsString()
  deviceID: string;
}

export class RegisterCustomerDto {
  @ApiProperty({ description: "User's phone" })
  @IsPhoneNumber('NG')
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: "User's email" })
  @IsEmail()
  email: string;

  @ApiProperty({ description: "User's password" })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: "User's register access token" })
  @IsString()
  @IsNotEmpty()
  registerAccessToken: string;
}

export class RegisterAgentDto {
  @ApiProperty({ description: "User's phone" })
  @IsPhoneNumber('NG')
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: "User's email" })
  @IsEmail()
  email: string;

  @ApiProperty({ description: "User's password" })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: "User's register access token" })
  @IsString()
  @IsNotEmpty()
  registerAccessToken: string;
}

export class IGreeIdpDto {
  @ApiProperty({ description: 'IGree idp consent url' })
  @IsString()
  url: string;
}

export class BvnRegisterDto {
  @ApiProperty({ description: 'BVN consent code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'BVN consent code' })
  @IsString()
  email: string;

  @ApiProperty({ description: 'BVN consent code' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'BVN consent code' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: 'Device Information',
    type: () => DeviceData,
  })
  deviceData: DeviceData;

  @ApiProperty({ description: "User's password" })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: "User's confirm password" })
  @IsString()
  @IsNotEmpty()
  @isMatch('password')
  confirm_password: string;
}
export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}
export class RegisterWithBvnOrPhoneDto {
  @ApiProperty({ description: "User's phone" })
  @IsPhoneNumber('NG')
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: "User's email" })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Device Data' })
  @ValidateNested()
  @Type(() => DeviceData)
  deviceData: DeviceData;

  @ApiProperty({ description: "User's password" })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: "User's confirm password" })
  @IsString()
  @IsNotEmpty()
  @isMatch('password')
  confirm_password: string;

  @ApiProperty({ description: "User's username" })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: "User's bvn" })
  @IsString()
  @IsOptional()
  bvn: string;

  @ApiProperty({ description: "User's register access token" })
  @IsString()
  @IsNotEmpty()
  registerAccessToken: string;

  @ApiProperty({ description: "User's device token" })
  @IsString()
  @IsNotEmpty()
  deviceToken: string;
  
  @ApiProperty({ description: "User's referal code" })
  @IsString()
  @IsOptional()
  referralCode: string;

  @ApiProperty({ description: "User's surname" })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: "User's last name" })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: "User's middle name" })
  @IsString()
  @IsOptional()
  middleName: string;

  @ApiProperty({ description: "User's dob" })
  @IsString()
  @IsNotEmpty()
  dob: string;

  @ApiProperty({
    enum: Gender,
    description: "The is the gender",
  })
  @IsString()
  @IsNotEmpty()
  gender: Gender;
}
