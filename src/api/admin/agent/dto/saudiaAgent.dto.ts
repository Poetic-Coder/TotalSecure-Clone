import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean, IsEmail, IsNotEmpty, IsNumber, isNumber, IsOptional, IsString, IsEnum,
    IsDateString,
    Min,
    ValidateNested,
    isEnum,
} from 'class-validator'
import { Transform, Type } from 'class-transformer';
import { Gender, IdentificationCardType } from '@prisma/client';


export class AddressDto {
    @ApiProperty({ example: '123 Adeola Odeku St' })
    @IsString()
    address: string;

    @ApiProperty({ example: 'Victoria Island' })
    @IsString()
    city: string;

    @ApiProperty({ example: 'Eti-Osa' })
    @IsString()
    lga: string;

    @ApiProperty({ example: 'Lagos' })
    @IsString()
    state: string;

    @ApiProperty({ example: 'Nigeria' })
    @IsString()
    country: string;
}

export class SaudiaAgentDto {
    @ApiProperty({ example: 'random string' })
    @IsNotEmpty()
    @IsString()
    registerAccessToken: string;

    @ApiProperty({ example: 'agent@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: '08123456789' })
    @IsString()
    @IsNotEmpty()
    phone: string;

    @ApiProperty({ example: 'John' })
    @IsString()
    firstName: string;

    @ApiProperty({ example: 'Doe' })
    @IsString()
    lastName: string;

    @ApiProperty({ example: 'MALE', enum: Gender })
    @IsEnum(Gender)
    gender: Gender;

    @ApiProperty({ example: '1990-01-01' })
    @IsDateString()
    @Transform(({ value }) => new Date(value).toISOString())
    dob: string;

    @ApiProperty({ example: 'https://example.com/photo.jpg' })
    @IsOptional()
    @IsString()
    photo?: string;
    // Nested Address for Buser KYC
    @ApiProperty({ type: AddressDto })
    @ValidateNested()
    @Type(() => AddressDto)
    agentAddress: AddressDto;
    // KYC Info
    @ApiProperty({ example: '22222222222' })
    @IsString()
    bvn: string;

    @ApiProperty({ example: 'https://example.com/logo.png' })
    @IsOptional()
    @IsString()
    logo?: string;

    @ApiProperty({ example: 'Tech services and software solutions' })
    @IsString()
    description: string;

    @ApiProperty({ example: 20 })
    @IsNumber()
    employees: string;

    @ApiProperty({ example: '', enum: IdentificationCardType })
    @IsEnum(IdentificationCardType)
    id_type: IdentificationCardType;

    @ApiProperty({ example: 'A1234567' })
    @IsString()
    id_number: string;

    @ApiProperty({ example: 'https://example.com/id.png' })
    @IsString()
    idImageUrl: string;

    @ApiProperty({ example: 'https://example.com/cac.png' })
    @IsString()
    cacImageUrl: string;

    @ApiProperty({ example: 'RC-123456' })
    @IsString()
    cacNumber: string;

    @ApiProperty({ example: 'Saudia Tech Ltd' })
    @IsString()
    name: string;

    // Nested Address for Business KYC
    @ApiProperty({ type: AddressDto })
    @ValidateNested()
    @Type(() => AddressDto)
    businessAddress: AddressDto;
}