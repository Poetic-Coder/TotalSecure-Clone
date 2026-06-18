import { IsPin } from '@common/validators/pin';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';


export class PinDto {
  @ApiProperty({
    description: "This is the user's pin"
  })
  @IsString()
  @IsPin()
  pin: string
}

export class ChangePinDto {
  @ApiProperty({
    description: "This is the user's old pin"
  })
  @IsString()
  @IsPin()
  oldPin: string

  @ApiProperty({
    description: "This is the user's new pin"
  })
  @IsString()
  @IsPin()
  newPin: string

  @ApiProperty({ description: "User's profile photo" })
  @IsString()
  @IsOptional()
  profilePhoto: string;

  @ApiProperty({ description: "User's neutral photo" })
  @IsString()
  @IsOptional()
  neutralPhoto: string;

  @ApiProperty({ description: "User's eyes closed photo" })
  @IsString()
  @IsOptional()
  eyesClosedPhoto: string;

  @ApiProperty({ description: "User's face up photo" })
  @IsString()
  @IsOptional()
  faceUpPhoto: string;

  @ApiProperty({ description: "User's face down photo" })
  @IsString()
  @IsOptional()
  faceDownPhoto: string;
}

export class ResetPinDto {
  @ApiProperty({
    description: "This is the otp access token"
  })
  @IsString()
  otpAccessToken: string

    @ApiProperty({ description: "User's phone" })
    @IsPhoneNumber('NG')
    @IsOptional()
    phone?: string;

    @ApiProperty({ description: "User's email" })
    @IsEmail()
    @IsOptional()
    email?: string;

  @ApiProperty({
    description: "This is the user's new pin"
  })
  @IsString()
  @IsPin()
  newPin: string

  @ApiProperty({ description: "User's profile photo" })
  @IsString()
  @IsOptional()
  profilePhoto: string;

  @ApiProperty({ description: "User's neutral photo" })
  @IsString()
  @IsOptional()
  neutralPhoto: string;

  @ApiProperty({ description: "User's eyes closed photo" })
  @IsString()
  @IsOptional()
  eyesClosedPhoto: string;

  @ApiProperty({ description: "User's face up photo" })
  @IsString()
  @IsOptional()
  faceUpPhoto: string;

  @ApiProperty({ description: "User's face down photo" })
  @IsString()
  @IsOptional()
  faceDownPhoto: string;
}

