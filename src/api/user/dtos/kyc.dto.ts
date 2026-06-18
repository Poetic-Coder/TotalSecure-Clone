import { IsDigit } from "@common/validators/digit";
import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IdentificationCardType } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUrl } from "class-validator";

export const IdCardType = {
  DRIVERS_LICENSE: 'DRIVERS_LICENSE',
  INTERNATIONAL_PASSPORT: 'INTERNATIONAL_PASSPORT',
  VOTERS_CARD: 'VOTERS_CARD',
  NATIONAL_ID: 'NATIONAL_ID'
};

export class BvnDto {
  @ApiProperty({ description: "User's BVN" })
  @IsDigit({ length: 11 }, { message: "BVN is not valid" })
  bvn: string;
}

export class NinDto {
  @ApiProperty({ description: "User's Virtual NIN" })
  @IsString()
  vnin: string;
}

export class IdentificationDto {
  @ApiProperty({ description: "User's identification image front url" })
  @IsUrl()
  front: string;

  @ApiProperty({ description: "User's identification image back url" })
  @IsUrl()
  back: string;

  @ApiProperty({ description: "User's identification card number" })
  @IsString()
  idNumber: string;

  @ApiProperty({
    description: "User's date of birth, only required for voters card verification"
  })
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  dob?: Date;

  @ApiProperty({ description: "User's identification type", enum: IdCardType})
  @IsString()
  idType: Exclude<IdentificationCardType, "NATIONAL_ID">;
}


export class AddressDto {
  @ApiProperty({ description: "User's address" })
  @IsString()
  address: string;

  @ApiProperty({ description: "State code of the address" })
  @IsString()
  state: string;

  @ApiProperty({ description: "Closest landmark to the address" })
  @IsString()
  landmark: string;

  @ApiProperty({ description: "Local government area code of the address" })
  @IsString()
  lga: string;

  @ApiProperty({ description: "Address verification document url" })
  @IsUrl()
  addressDocument: string;

  @ApiProperty({ description: "City of the address" })
  @IsString()
  city: string;
}

export class DigitalAddressDto extends  OmitType(AddressDto, ['addressDocument'] as const) {
  @ApiProperty({ description: "Latitude of the address" })
  @IsNumber()
  latitude: number;

  @ApiProperty({ description: "Longitude of the address" })
  @IsNumber()
  longitude: number;

  @ApiProperty({ description: "Address verification document url" })
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
