import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from 'class-validator';


export class ForgotPasswordDto {
  @ApiProperty({ description: "User's phone" })
  @IsPhoneNumber('NG')
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: "User's email" })
  @IsEmail()
  @IsOptional()
  email?: string;
}

export class ForgotPasswordResetDto {
  @ApiProperty({ description: "User's phone" })
  @IsPhoneNumber('NG')
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: "User's email" })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: "User's otp" })
  @IsString()
  @IsNotEmpty()
  otp: string;

  @ApiProperty({ description: "User's new password" })
  @IsString()
  @IsNotEmpty()
  password: string;

    @ApiProperty({ description: "User's username" })
    @IsString()
    @IsOptional()
    username: string;
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

export class NewForgotPasswordResetDto {
  @ApiProperty({ description: "User's phone" })
  @IsPhoneNumber('NG')
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: "User's email" })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: "User's otp" })
  @IsString()
  @IsNotEmpty()
  otpAccessToken: string;

  @ApiProperty({ description: "User's new password" })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: "For coperate users" })
  @IsOptional()
  slug: string;

    @ApiProperty({ description: "User's username" })
    @IsString()
    @IsOptional()
    username: string;


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


  