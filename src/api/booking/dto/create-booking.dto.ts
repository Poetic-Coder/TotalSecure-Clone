import { ApiProperty } from '@nestjs/swagger';
import { BookingType, PaymentMethod, TripClass, Currency, Gender, GroupBookingStatus } from '@prisma/client';
import {
  IsArray,
  IsDate,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsObject,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

class PassengerInputDto {
  @ApiProperty({ description: "Passenger's first name.", example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: "Passenger's last name.", example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

   @ApiProperty({
    description: "Passenger's gender.",
    enum: Gender, 
    example: Gender.MALE,
  })
  @IsEnum(Gender) 
  @IsNotEmpty()
  gender: Gender;

  @ApiProperty({
    description: "Passenger's date of birth in ISO 8601 format (YYYY-MM-DD).",
    example: '1990-05-15',
  })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ description: 'Passenger nationality.', example: 'Canadian' })
  @IsString()
  @IsNotEmpty()
  nationality: string;

  @ApiProperty({
    description: "Passenger's passport number.",
    example: 'A12345678',
  })
  @IsString()
  @IsNotEmpty()
  passportNumber: string;

  @ApiProperty({
    description: "Passport expiry date in ISO 8601 format (YYYY-MM-DD).",
    example: '2030-05-15',
  })
  @IsDateString()
  passportExpiry: string;

  @ApiProperty({
    description: 'The country that issued the passport.',
    example: 'Canada',
  })
  @IsString()
  @IsNotEmpty()
  passportCountry: string;
  
  @ApiProperty({
    description: 'The travel class for this passenger.',
    enum: TripClass,
    example: TripClass.ECONOMY,
  })
  @IsEnum(TripClass)
  class: TripClass;
}

export class CreateBookingDto {
  @ApiProperty({ description: 'The unique ID of the trip being booked.' })
  @IsUUID()
  tripId: string;

  @ApiProperty({
    description: 'The ID of the customer making the booking (if applicable).',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  customerId?: string;

  @ApiProperty({
    description: 'The ID of the agent making the booking (if applicable).',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  agentId?: string;

  @ApiProperty({
    description: 'The ID of the staff creating the booking (if applicable).',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  staffId?: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CARD })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'Base fare amount for the booking.', example: 550.0 })
  @IsNumber()
  @Min(0)
  baseAmount: number;

  @ApiProperty({ description: 'Total amount to be paid.', example: 625.5 })
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiProperty({
    type: [PassengerInputDto],
    description: 'An array of passenger details for this booking.',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PassengerInputDto)
  passengers: PassengerInputDto[];
}


class AirportDto {
  @ApiProperty({ example: 'LOS' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Murtala Muhammed International Airport' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Lagos' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Nigeria' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ example: 'Africa/Lagos' })
  @IsOptional()
  @IsString()
  timezone?: string;
}

class AircraftDto {
  @ApiProperty({ example: 'A7-ALU' })
  @IsOptional()
  @IsString()
  registration?: string;

  @ApiProperty({ example: 'Airbus A350' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ example: 300 })
  @IsOptional()
  @IsNumber()
  totalSeats?: number;

  @ApiProperty({ example: 200 })
  @IsOptional()
  @IsNumber()
  economySeats?: number;

  @ApiProperty({ example: 80 })
  @IsOptional()
  @IsNumber()
  businessSeats?: number;

  @ApiProperty({ example: 20 })
  @IsOptional()
  @IsNumber()
  firstClassSeats?: number;
}

export class SearchFlightsQueryDto {
  @ApiProperty({ description: 'Origin airport code', example: 'SYD' })
  @IsString()
  @Transform(({ value }) => String(value).toUpperCase())
  originLocationCode: string;

  @ApiProperty({ description: 'Destination airport code', example: 'BKK' })
  @IsString()
  @Transform(({ value }) => String(value).toUpperCase())
  destinationLocationCode: string;

  @ApiProperty({ description: 'Departure date (YYYY-MM-DD)', example: '2025-12-20' })
  @IsDateString()
  @Transform(({ value }) => String(value))
  departureDate: string;

  @ApiProperty({ description: 'Return date (YYYY-MM-DD)', example: '2025-12-27', required: false })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value ? String(value) : undefined))
  returnDate?: string;

  @ApiProperty({ description: 'Number of adults', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  adults?: number;

  @ApiProperty({ description: 'Number of children', example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  children?: number;

  @ApiProperty({ description: 'Number of infants', example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  infants?: number;

  @ApiProperty({ description: 'Travel class', enum: TripClass, default: TripClass.ECONOMY })
  @IsOptional()
  @IsEnum(TripClass, { message: 'Invalid travel class' })
  travelClass?: TripClass;

  @ApiProperty({ description: 'Currency code', enum: Currency, default: Currency.SAR })
  @IsOptional()
  @IsEnum(Currency, { message: 'Invalid currency code' })
  currencyCode?: Currency;

  @ApiProperty({ description: 'Max results', example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  max?: number;
}

class CreateGroupBookingDto {
  @ApiProperty({ description: 'The full flight offer object for this specific flight, returned from the Amadeus search API.' })
  @IsObject()
  flightOffer: any;

  @ApiProperty({ example: 'Annual Staff Retreat', description: 'The user-defined name for this group booking.' })
  @IsString()
  groupName: string;

  @ApiProperty({ example: 25, description: 'The total number of passengers in the group.' })
  @IsInt()
  @Min(10) 
  passengerCount: number;
}

export class CreateGroupBookingRequestDto {
  @ApiProperty({ type: [CreateGroupBookingDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGroupBookingDto)
  bookings: CreateGroupBookingDto[];
}

export class GetGroupBookingsDto {
  @IsOptional()
  @IsEnum(GroupBookingStatus, { message: 'Invalid status value' })
  status?: GroupBookingStatus;

  @IsOptional()
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  @Transform(({ value }) => (value ? parseInt(value, 10) : 1))
  page: number = 1;

  @IsOptional()
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Transform(({ value }) => (value ? parseInt(value, 10) : 10))
  limit: number = 10;
}
