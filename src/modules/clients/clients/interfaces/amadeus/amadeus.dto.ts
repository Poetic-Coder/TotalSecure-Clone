import { IsArray, IsBoolean, IsDateString, IsEmail, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum TravelerType {
  ADULT = 'ADULT',
  CHILD = 'CHILD',
  SENIOR = 'SENIOR',
  YOUNG = 'YOUNG',
  HELD_INFANT = 'HELD_INFANT',
  SEATED_INFANT = 'SEATED_INFANT',
  STUDENT = 'STUDENT',
}

export enum cabinType {
  ECONOMY = 'ECONOMY',
  PREMIUM_ECONOMY = 'PREMIUM_ECONOMY',
  BUSINESS = 'BUSINESS',
  FIRST = 'FIRST'
}

export enum coverageType {
  MOST_SEGMENTS = 'MOST_SEGMENTS',
  AT_LEAST_ONE_SEGMENT = 'AT_LEAST_ONE_SEGMENT',
  ALL_SEGMENTS = 'ALL_SEGMENTS',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

export enum DocumentType {
  PASSPORT = 'PASSPORT',
  ID_CARD = 'ID_CARD'
}

export enum DeviceType {
  MOBILE = 'MOBILE',
  LANDLINE = 'LANDLINE'
}

export enum RemarkSubType {
  GENERAL_MISCELLANEOUS = 'GENERAL_MISCELLANEOUS'
}

export enum TicketingOption {
  DELAY_TO_CANCEL = 'DELAY_TO_CANCEL'
}

export enum ContactPurpose {
  STANDARD = 'STANDARD'
}

export class DepartureDateTimeRangeDto {
  @ApiProperty({ example: '2025-11-25' })
  @IsDateString()
   date: string;

  @ApiProperty({ example: '10:00:00' })
  @IsString()
   time: string;
}

export class OriginDestinationDto {
  @ApiProperty({ example: '1' })
  @IsString()
   id: string;

  @ApiProperty({ example: 'BOS' })
  @IsString()
   originLocationCode: string;

  @ApiProperty({ example: 'MAD' })
  @IsString()
   destinationLocationCode: string;

  @ApiProperty({ type: DepartureDateTimeRangeDto })
  @ValidateNested()
  @Type(() => DepartureDateTimeRangeDto)
   departureDateTimeRange: DepartureDateTimeRangeDto;
}

export class TravelerDto {
  @ApiProperty({ example: '1' })
  @IsString()
  id: string;

  @ApiProperty({ enum: TravelerType, example: TravelerType.ADULT })
  @IsEnum(TravelerType)
  travelerType: TravelerType;

  @ApiProperty({ type: [String], example: ['STANDARD'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fareOptions?: string[];
}

export class CabinRestrictionDto {
  @ApiProperty({ enum: cabinType, example: cabinType.BUSINESS })
  @IsEnum(cabinType)
   cabin: cabinType;

  @ApiProperty({
    enum: coverageType,
    example: coverageType.MOST_SEGMENTS,
  })
  @IsEnum(coverageType)
   coverage: coverageType;

  @ApiProperty({ type: [String], example: ['1'] })
  @IsArray()
  @IsString({ each: true })
   originDestinationIds: string[];
}

export class FlightFiltersDto {
  @ApiProperty({
    type: [CabinRestrictionDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CabinRestrictionDto)
   cabinRestrictions?: CabinRestrictionDto[];
}

export class SearchCriteriaDto {
  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(2)
   maxFlightOffers: number = 10;

  @ApiProperty({ type: FlightFiltersDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => FlightFiltersDto)
   flightFilters?: FlightFiltersDto;
}

// MAIN REQUEST DTO
export class FlightOfferSearchRequestDto {
  @ApiProperty({ example: 'USD' })
  @IsString()
  currencyCode: string;

  @ApiProperty({ type: [OriginDestinationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OriginDestinationDto)
  originDestinations: OriginDestinationDto[];

  @ApiProperty({ type: [TravelerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TravelerDto)
  travelers: TravelerDto[];

  @ApiProperty({ type: [String], example: ['GDS'] })
  @IsArray()
  @IsString({ each: true })
  sources: string[];

  @ApiProperty({ type: SearchCriteriaDto })
  @ValidateNested()
  @Type(() => SearchCriteriaDto)
  searchCriteria: SearchCriteriaDto;
}



// --- Segment Departure/Arrival ---=============================================================
// Basic atomic DTOs first
export class AirportInfoDto {
  @ApiProperty({ example: 'BOS' })
  @IsString()
  iataCode: string;

  @ApiProperty({ example: 'E', required: false })
  @IsOptional()
  @IsString()
  terminal?: string;

  @ApiProperty({ example: '2025-11-27T17:35:00' })
  @IsDateString()
  at: string;
}

export class AircraftDto {
  @ApiProperty({ example: '32Q' })
  @IsString()
  code: string;
}

export class OperatingInfoDto {
  @ApiProperty({ example: 'SK', required: false })
  @IsOptional()
  @IsString()
  carrierCode?: string;

  @ApiProperty({ example: 'SAS CONNECT', required: false })
  @IsOptional()
  @IsString()
  carrierName?: string;
}

export class MoneyAmountDto {
  @ApiProperty({ example: 'USD' })
  @IsString()
  currency: string;

  @ApiProperty({ example: '648.23' })
  @IsString()
  total: string;

  @ApiProperty({ example: '255.00' })
  @IsString()
  base: string;
}

export class FeeDto {
  @ApiProperty({ example: '0.00' })
  @IsString()
  amount: string;

  @ApiProperty({ example: 'SUPPLIER' })
  @IsString()
  type: string;
}

export class AdditionalServiceDto {
  @ApiProperty({ example: '150.00' })
  @IsString()
  amount: string;

  @ApiProperty({ example: 'CHECKED_BAGS' })
  @IsString()
  type: string;
}

export class BaggageAllowanceDto {
  @ApiProperty({ example: 0 })
  @IsNumber()
  quantity: number;
}

export class AmenityProviderDto {
  @ApiProperty({ example: 'BrandedFare' })
  @IsString()
  name: string;
}

export class AmenityDto {
  @ApiProperty({ example: '1 CHECKED BAG UP TO 23KG' })
  @IsString()
  description: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isChargeable: boolean;

  @ApiProperty({ example: 'BAGGAGE' })
  @IsString()
  amenityType: string;

  @ApiProperty({ type: AmenityProviderDto })
  @ValidateNested()
  @Type(() => AmenityProviderDto)
  amenityProvider: AmenityProviderDto;
}

export class SegmentDto {
  @ApiProperty({ type: AirportInfoDto })
  @ValidateNested()
  @Type(() => AirportInfoDto)
  departure: AirportInfoDto;

  @ApiProperty({ type: AirportInfoDto })
  @ValidateNested()
  @Type(() => AirportInfoDto)
  arrival: AirportInfoDto;

  @ApiProperty({ example: 'SK' })
  @IsString()
  carrierCode: string;

  @ApiProperty({ example: '928' })
  @IsString()
  number: string;

  @ApiProperty({ type: AircraftDto })
  @ValidateNested()
  @Type(() => AircraftDto)
  aircraft: AircraftDto;

  @ApiProperty({ type: OperatingInfoDto })
  @ValidateNested()
  @Type(() => OperatingInfoDto)
  operating: OperatingInfoDto;

  @ApiProperty({ example: 'PT7H25M' })
  @IsString()
  duration: string;

  @ApiProperty({ example: '48' })
  @IsString()
  id: string;

  @ApiProperty({ example: 0 })
  @IsNumber()
  numberOfStops: number;

  @ApiProperty({ example: false })
  @IsBoolean()
  blacklistedInEU: boolean;
}

export class ItineraryDto {
  @ApiProperty({ example: 'PT16H35M' })
  @IsString()
  duration: string;

  @ApiProperty({ type: [SegmentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SegmentDto)
  segments: SegmentDto[];
}

export class PriceDetailsDto {
  @ApiProperty({ example: 'USD' })
  @IsString()
  currency: string;

  @ApiProperty({ example: '1232.46' })
  @IsString()
  total: string;

  @ApiProperty({ example: '446.00' })
  @IsString()
  base: string;

  @ApiProperty({ type: [FeeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeeDto)
  fees: FeeDto[];

  @ApiProperty({ example: '1232.46' })
  @IsString()
  grandTotal: string;

  @ApiProperty({ type: [AdditionalServiceDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdditionalServiceDto)
  additionalServices?: AdditionalServiceDto[];
}

export class PricingOptionsDto {
  @ApiProperty({ example: ['PUBLISHED'] })
  @IsArray()
  @IsString({ each: true })
  fareType: string[];

  @ApiProperty({ example: false })
  @IsBoolean()
  includedCheckedBagsOnly: boolean;
}

export class FareDetailsBySegmentDto {
  @ApiProperty({ example: '48' })
  @IsString()
  segmentId: string;

  @ApiProperty({ example: 'ECONOMY' })
  @IsString()
  cabin: string;

  @ApiProperty({ example: 'TLWA6GHT' })
  @IsString()
  fareBasis: string;

  @ApiProperty({ example: 'LIGHT' })
  @IsString()
  brandedFare: string;

  @ApiProperty({ example: 'LIGHT' })
  @IsString()
  brandedFareLabel: string;

  @ApiProperty({ example: 'T' })
  @IsString()
  class: string;

  @ApiProperty({ type: BaggageAllowanceDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => BaggageAllowanceDto)
  includedCheckedBags?: BaggageAllowanceDto;

  @ApiProperty({ type: BaggageAllowanceDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => BaggageAllowanceDto)
  includedCabinBags?: BaggageAllowanceDto;

  @ApiProperty({ type: [AmenityDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AmenityDto)
  amenities: AmenityDto[];
}

export class TravelerPricingDto {
  @ApiProperty({ example: '1' })
  @IsString()
  travelerId: string;

  @ApiProperty({ example: 'STANDARD' })
  @IsString()
  fareOption: string;

  @ApiProperty({ enum: TravelerType, example: TravelerType.ADULT })
  @IsEnum(TravelerType)
  travelerType: TravelerType;

  @ApiProperty({ type: MoneyAmountDto })
  @ValidateNested()
  @Type(() => MoneyAmountDto)
  price: MoneyAmountDto;

  @ApiProperty({ type: [FareDetailsBySegmentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FareDetailsBySegmentDto)
  fareDetailsBySegment: FareDetailsBySegmentDto[];
} 

export class FlightOfferDto {
  @ApiProperty({ example: 'flight-offer' })
  @IsString()
  type: string;

  @ApiProperty({ example: '1' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'GDS' })
  @IsString()
  source: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  instantTicketingRequired: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  nonHomogeneous: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  oneWay: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  isUpsellOffer: boolean;

  @ApiProperty({ example: '2025-11-26' })
  @IsDateString()
  lastTicketingDate: string;

  @ApiProperty({ example: '2025-11-26' })
  @IsDateString()
  lastTicketingDateTime: string;

  @ApiProperty({ example: 9 })
  @IsNumber()
  numberOfBookableSeats: number;

  @ApiProperty({ type: [ItineraryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItineraryDto)
  itineraries: ItineraryDto[];

  @ApiProperty({ type: PriceDetailsDto })
  @ValidateNested()
  @Type(() => PriceDetailsDto)
  price: PriceDetailsDto;

  @ApiProperty({ type: PricingOptionsDto })
  @ValidateNested()
  @Type(() => PricingOptionsDto)
  pricingOptions: PricingOptionsDto;

  @ApiProperty({ example: ['SK'] })
  @IsArray()
  @IsString({ each: true })
  validatingAirlineCodes: string[];

  @ApiProperty({ type: [TravelerPricingDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TravelerPricingDto)
  travelerPricings: TravelerPricingDto[];
}

export class FlightOffersPricingDataDto {
  @ApiProperty({ example: 'flight-offers-pricing' })
  @IsString()
  type: string;

  @ApiProperty({ type: [FlightOfferDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlightOfferDto)
  flightOffers: FlightOfferDto[];
}

export class FlightOffersPriceDto {
  @ApiProperty({ 
    description: 'Flight offers pricing data',
    type: FlightOffersPricingDataDto
  })
  @ValidateNested()
  @Type(() => FlightOffersPricingDataDto)
  data: FlightOffersPricingDataDto;
} 

// ================Booking===========================================================================

export class NameDto {
  @ApiProperty({ example: 'JORGE' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'GONZALES' })
  @IsString()
  lastName: string;
}

export class PhoneDto {
  @ApiProperty({ enum: DeviceType, example: DeviceType.MOBILE })
  @IsEnum(DeviceType)
  deviceType: DeviceType;

  @ApiProperty({ example: '34' })
  @IsString()
  countryCallingCode: string;

  @ApiProperty({ example: '480080076' })
  @IsString()
  number: string;
}

export class ContactDto {
  @ApiProperty({ example: 'jorge.gonzales833@telefonica.es' })
  @IsEmail()
  emailAddress: string;

  @ApiProperty({ type: [PhoneDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhoneDto)
  phones: PhoneDto[];
}

export class DocumentDto {
  @ApiProperty({ enum: DocumentType, example: DocumentType.PASSPORT })
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @ApiProperty({ example: 'Madrid' })
  @IsString()
  birthPlace: string;

  @ApiProperty({ example: 'Madrid' })
  @IsString()
  issuanceLocation: string;

  @ApiProperty({ example: '2015-04-14' })
  @IsDateString()
  issuanceDate: string;

  @ApiProperty({ example: '00000000' })
  @IsString()
  number: string;

  @ApiProperty({ example: '2025-04-14' })
  @IsDateString()
  expiryDate: string;

  @ApiProperty({ example: 'ES' })
  @IsString()
  issuanceCountry: string;

  @ApiProperty({ example: 'ES' })
  @IsString()
  validityCountry: string;

  @ApiProperty({ example: 'ES' })
  @IsString()
  nationality: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  holder: boolean;
}

// Note: Using different name to avoid conflict with existing TravelerDto
export class FlightOrderTravelerDto {
  @ApiProperty({ example: '1' })
  @IsString()
  id: string;

  @ApiProperty({ example: '1982-01-16' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ type: NameDto })
  @ValidateNested()
  @Type(() => NameDto)
  name: NameDto;

  @ApiProperty({ enum: Gender, example: Gender.MALE })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ type: ContactDto })
  @ValidateNested()
  @Type(() => ContactDto)
  contact: ContactDto;

  @ApiProperty({ type: [DocumentDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentDto)
  documents?: DocumentDto[];
}

export class RemarkDto {
  @ApiProperty({ enum: RemarkSubType, example: RemarkSubType.GENERAL_MISCELLANEOUS })
  @IsEnum(RemarkSubType)
  subType: RemarkSubType;

  @ApiProperty({ example: 'ONLINE BOOKING FROM INCREIBLE VIAJES' })
  @IsString()
  text: string;
}

export class RemarksDto {
  @ApiProperty({ type: [RemarkDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RemarkDto)
  general: RemarkDto[];
}

export class TicketingAgreementDto {
  @ApiProperty({ enum: TicketingOption, example: TicketingOption.DELAY_TO_CANCEL })
  @IsEnum(TicketingOption)
  option: TicketingOption;

  @ApiProperty({ example: '6D' })
  @IsString()
  delay: string;
}

export class AddressDto {
  @ApiProperty({ example: ['Calle Prado, 16'] })
  @IsArray()
  @IsString({ each: true })
  lines: string[];

  @ApiProperty({ example: '28014' })
  @IsString()
  postalCode: string;

  @ApiProperty({ example: 'Madrid' })
  @IsString()
  cityName: string;

  @ApiProperty({ example: 'ES' })
  @IsString()
  countryCode: string;
}

export class AddresseeNameDto {
  @ApiProperty({ example: 'PABLO' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'RODRIGUEZ' })
  @IsString()
  lastName: string;
}

export class ContactDetailDto {
  @ApiProperty({ type: AddresseeNameDto })
  @ValidateNested()
  @Type(() => AddresseeNameDto)
  addresseeName: AddresseeNameDto;

  @ApiProperty({ example: 'INCREIBLE VIAJES', required: false })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({ enum: ContactPurpose, example: ContactPurpose.STANDARD })
  @IsEnum(ContactPurpose)
  purpose: ContactPurpose;

  @ApiProperty({ type: [PhoneDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhoneDto)
  phones: PhoneDto[];

  @ApiProperty({ example: 'support@increibleviajes.es' })
  @IsEmail()
  emailAddress: string;

  @ApiProperty({ type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}

export class FlightOrderDataDto {
  @ApiProperty({ example: 'flight-order' })
  @IsString()
  type: string;

  @ApiProperty({ type: [FlightOfferDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlightOffersPriceDto)
  flightOffers: FlightOffersPriceDto[];

  @ApiProperty({ type: [FlightOrderTravelerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlightOrderTravelerDto)
  travelers: FlightOrderTravelerDto[];

  @ApiProperty({ type: RemarksDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => RemarksDto)
  remarks?: RemarksDto;

  @ApiProperty({ type: TicketingAgreementDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => TicketingAgreementDto)
  ticketingAgreement?: TicketingAgreementDto;

  @ApiProperty({ type: [ContactDetailDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactDetailDto)
  contacts?: ContactDetailDto[];
}

export class FlightOrderDto {
  @ApiProperty({ 
    description: 'Flight order data',
    type: FlightOrderDataDto
  })
  @ValidateNested()
  @Type(() => FlightOrderDataDto)
  data: FlightOrderDataDto;
}



