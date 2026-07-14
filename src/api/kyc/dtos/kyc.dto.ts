import { IsDigit } from '@common/validators/digit';
import { IsValidID } from '@common/validators/id-validator';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import {  Gender, IdentificationCardType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsDate, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';

export const IdCardType = {
  DRIVERS_LICENSE: 'DRIVERS_LICENSE',
  INTERNATIONAL_PASSPORT: 'INTERNATIONAL_PASSPORT',
  VOTERS_CARD: 'VOTERS_CARD',
};

export class BvnDto {
  @ApiProperty({ description: "User's BVN" })
  @IsDigit({ length: 11 }, { message: 'BVN is not valid' })
  bvn: string;
}

export class NinDto {
  @ApiProperty({ description: "User's NIN" })
  @IsString()
  nin: string;
}

export class IdentificationDto {
  @ApiProperty({ description: "User's identification image front url" })
  @IsUrl()
  idImageURl: string;

  @ApiProperty({ description: "User's identification card number" })
  @IsString()
  @IsValidID()
  idNumber: string;

  @ApiProperty({
    description:
      "User's date of birth, only required for voters card verification",
  })
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  dob?: Date;

  @ApiProperty({ description: "User's identification type", enum: IdCardType })
  @IsString()
  idType: IdentificationCardType;
}

export class CacVerifcationDto {
  @ApiProperty({
    description: "Business identification image front url",
  })
  @IsUrl()
  image: string;


  @ApiProperty({ description: 'Business registration number' })
  @IsString()
  @IsNotEmpty()
  regNumber: string;

  @ApiProperty({ description: 'cac validation type' })
  @IsString()
  @IsOptional()
  type?: string;
}

export class uploadSignatureDto {
  @ApiProperty({ description: "User's identification image front url" })
  @IsString()
  image: string;
}

export class AddressDto {
  @ApiProperty({ description: "User's address" })
  @IsString()
  address: string;

  @ApiProperty({ description: 'State code of the address' })
  @IsString()
  state: string;

  @ApiProperty({ description: 'Closest landmark to the address' })
  @IsString()
  landmark: string;

  @ApiProperty({ description: 'Local government area code of the address' })
  @IsString()
  lga: string;

  @ApiProperty({ description: 'Address verification document url' })
  @IsUrl()
  addressDocument: string;

  @ApiProperty({ description: 'City of the address' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'Building number' })
  @IsString()
  buildingNumber: string;
  
}

export class DigitalAddressDto extends OmitType(AddressDto, [
  'addressDocument',
] as const) {
  @ApiProperty({ description: 'Latitude of the address' })
  @IsNumber()
  latitude: number;

  @ApiProperty({ description: 'Longitude of the address' })
  @IsNumber()
  longitude: number;

  @ApiProperty({ description: 'Address verification document url' })
  @IsUrl()
  addressDocument: string;
}

export class StateObjectDto {
  @ApiProperty({ description: "State's code" })
  @IsString()
  stateCode: string;

  @ApiProperty({ description: "State's name" })
  @IsString()
  stateName: string;
}

export class LgaObjectDto {
  @ApiProperty({ description: "State's code" })
  @IsString()
  stateCode: string;

  @ApiProperty({ description: "LGA's code" })
  @IsString()
  lgaCode: string;

  @ApiProperty({ description: "LGA's name" })
  @IsString()
  lgaName: string;
}

export class updateAgentProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type()
  @IsDate()
  dob?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty({ enum: Gender, required: false })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nationality?: string;

  // Address
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  homeAddress?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({ example: 'Ikeja LGA' })
  @IsOptional()
  @IsString()
  lga?: string;
}

export class UpdateAgentKycDto {
  @ApiProperty({ example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty({ example: 'We specialize in flight bookings and hotel reservations.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '12 Palm Avenue, Lagos' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'Ikeja' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'Lagos' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: 'Ikeja LGA' })
  @IsOptional()
  @IsString()
  lga?: string;

  @ApiProperty({ example: '10 - 200 employees' })
  @IsOptional()
  @IsString()
  employees?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country?: string;

}
