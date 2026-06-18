import { AddressDto } from "@api/kyc/dtos/kyc.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class FormData {
  @ApiProperty({ description: "User's firstName" })
  @IsString()
  firstName: string;

  @ApiProperty({ description: "User's lastName" })
  @IsString()
  lastName: string;

  @ApiProperty({ description: "User's mobile" })
  @IsString()
  mobile: string;

  @ApiProperty({ description: "User's image" })
  @IsString()
  image: string;
}

export class PhysicalAddressDto {

  @ApiProperty({ description: "User's address" })
  @IsString()
  @IsOptional()
  type: string;

  @ApiProperty({ description: 'State code of the address' })
  @IsString()
  @IsOptional()
  idNumber: string;

  @ApiProperty({ description: 'Users info' })
  formData: FormData;

  @ApiProperty({ description: 'Boolean prop' })
  @IsString()
  subjectConsent: boolean;

  @ApiProperty({ description: 'Address verification document url' })
  address: AddressDto;
}


export class OkHiAddressDto {

  @ApiProperty({ description: 'id of the address/location' })
  @IsString()
  @IsOptional()
  addressId: string;
}

export enum AccountHolderType {
  LEGAL_ENTITY = "LEGAL_ENTITY",
  INDIVIDUAL = "INDIVIDUAL",
  EMPTY = "EMPTY"
}

export enum Direction {
  OUTFLOW = "OUTFLOW",
  INFLOW = "INFLOW"
}

export enum CountryCode {
  NG = "NG",
  UK = "UK",
  USA = "USA"
}

export enum Purpose {
  FEE = "FEE",
  INTEREST = "INTEREST",
  PAYMENT = "PAYMENT",
  REVERSAL = "REVERSAL",
  CORRECTION = "CORRECTION",
  BILL_PAY = "BILL_PAY",
  INTRA_ACTOR = "INTRA_ACTOR",
  REFUND = "REFUND",
  CHARGE_BACK = "CHARGE_BACK",
  UNKNOWN = "UNKNOWN"
}

export enum Currency {
  NGN = "NGN",
  USD = "USD",
  GBP = "GBP",
  EUR = "EUR"
}

export enum Instrument {
  CASH = "CASH",
  CHECK = "CHECK",
  DIRECT_DEBIT = "DIRECT_DEBIT",
  STANDING_ORDER = "STANDING_ORDER",
  TRANSFER = "TRANSFER",
  CARD = "CARD",
  VIRTUAL = "VIRTUAL",
  PROMISSORY_NOTE = "PROMISSORY_NOTE",
  UNKNOWN = "UNKNOWN"
}
type Source = {
    accountNumber: string;
    accountHolderType: AccountHolderType;
    accountName: string;
    bankName: string;
    bankCode: string;
};

type Beneficiary = {
    accountHolderType: AccountHolderType;
    accountNumber: string;
    accountName: string;
    bankName: string;
    countryCode: CountryCode;
    bankCode: string;
};

export interface Transaction {
    transactionReference: string;
    transactionDate: Date;
    direction: Direction;
    currency: Currency;
    amount: number;
    localAmount: number;
    purpose: Purpose;
    instrument: Instrument;
    countryCode: CountryCode;
    source: Source;
    beneficiary: Beneficiary;
}

export interface ITransactionResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Record<string, unknown>;
  links: any[];
}

export interface EvaluationResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    docs: EvaluationDoc[];
    pagination: Pagination;
  };
  links: any[];
}

interface EvaluationDoc {
  transactionIds: string[];
  businessId: string;
  sourceId: string;
  beneficiaryId: string;
  thirdPartyAcctNumber: string;
  triggeredTags: TriggeredTag[];
  valueAtRisk: number;
  currency: string;
  detectionDate: string;
  createdAt: string;
  lastModifiedAt: string;
  startDate: string;
  endDate: string;
  id: string;
}

interface TriggeredTag {
  _id: string;
  tag: string;
  ruleScore: number;
  ruleId: string;
  ruleAction: string;
}

interface Pagination {
  totalDocs: number;
  perPage: number;
  totalPages: number;
  currentPage: number;
  serialNo: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

enum SearchType {
  All = "all",
  Individual = "individual",
  Business = "business",
}

export enum SearchBy {
  name = 'name',
  identity = 'identity'
}

export enum RiskCheckType {
  Individual = "individual",
  Business = "business",
}

export interface IamlSearch {
  searchBy: SearchBy;
  type: SearchType;
  query: string;
  isSubjectConsent: boolean;
  advancedSearch?: {
    lastName?: string;
    firstName?: string;
    religion?: string;
    birthPlace?: string;
    position?: string;
    keywords?: string;
    gender?: string;
    country?: string;
    education?: string;
  };
}


export interface AmlResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Data;
  links: any[];
}

interface Data {
  status: string;
  parentId: string | null;
  isSubjectConsent: boolean;
  type: string;
  sanctions: Sanction[];
  pep: any[];
  crime: any[];
  debarment: any[];
  financial_services: any[];
  government: any[];
  role: any[];
  religion: any[];
  military: any[];
  frozen_asset: any[];
  personOfInterest: any[];
  totalEntity: number;
  categoryCount: CategoryCount;
  queriedWith: string;
  query: string;
  businessId: string;
  requestedAt: string;
  requestedById: string;
  createdAt: string;
  lastModifiedAt: string;
  _createdAt: string;
  _lastModifiedAt: string;
  id: string;
  requestedBy: RequestedBy;
}

interface CategoryCount {
  sanctions: number;
  pep: number;
  crime: number;
  debarment: number;
  financial_services: number;
  government: number;
  role: number;
  religion: number;
  military: number;
  frozen_asset: number;
  personOfInterest: number;
}

interface RequestedBy {
  firstName: string;
  lastName: string;
  middleName: string;
  id: string;
}

interface Sanction {
  title: string[];
  entityType: string;
  datasets: string[];
  birthDate: string[];
  firstName: string[];
  nationality: string[];
  notes: string[];
  topics: string[];
  weakAlias: string[];
  addressEntity: AddressEntity[];
  alias: string[];
  country: string[];
  name: string[];
  position: string[];
  middleName: string[];
  secondName: string[];
  lastName: string[];
  deathDate: string[];
  religion: string[];
  fatherName: string[];
  birthPlace: string[];
  gender: string[];
  sourceUrl: string[];
  ethnicity: string[];
  sanctions: SubSanction[];
  unknownLinkTo: UnknownLinkTo[];
  unknownLinkFrom: UnknownLinkFrom[];
}

interface AddressEntity {
  country: string[];
  full: string[];
}

interface SubSanction {
  sourceUrl: string[];
  unscId?: string[];
  startDate?: string[];
  program?: string[];
  listingDate?: string[];
  authority?: string[];
  country?: string[];
  summary?: string[];
  reason?: string[];
  provisions?: string[];
  status?: string[];
}

interface UnknownLinkTo {
  object: LinkedObject[];
  role: string[];
}

interface UnknownLinkFrom {
  subject: LinkedObject[];
  role: string[];
}

interface LinkedObject {
  sourceUrl?: string[];
  weakAlias?: string[];
  alias?: string[];
  notes?: string[];
  country?: string[];
  name?: string[];
  topics?: string[];
  previousName?: string[];
  incorporationDate?: string[];
}

export interface RiskVerification {
  type: RiskCheckType;
  firstName?: string;
  lastName?: string;
  businessName?: string | null;
  businessIndustry?: string | null;
  country: string;
  city: string;
  advanceOptions?: AdvanceOptions;
  isSubjectConsent: boolean;
}

interface AdvanceOptions {
  idNumber?: string;
  idExpiryDate?: Date | null;
  isIdVerified?: boolean;
  phoneNumber?: string;
  lengthOfStay?: string;
  occupation?: string;
  industry?: string;
}



export interface ICreateRiskReportResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: ICreateRiskReportData;
  links: any[];
}

interface ICreateRiskReportData {
  latestReport: any | null;
  parentId: string | null;
  type: string;
  latestRiskScore: number;
  latestAdverseMediaScore: number;
  latestRiskStatus: string;
  trackingInterval: number;
  trackingStatus: string;
  riskReportHistory: any[];
  _id: string;
  entityInformation: EntityInformation;
  businessId: string;
  requestedAt: string;
  requestedById: string;
  reportNextUpdateAt: string;
  reportlastUpdatedAt: string;
  createdAt: string;
  lastModifiedAt: string;
  _createdAt: string;
  _lastModifiedAt: string;
  enterpriseCode: number;
  allValidationPassed: boolean;
  id: string;
  metadata: Record<string, any>;
  requestedBy: RequestedBy;
}

interface EntityInformation {
  businessInformation: BusinessInformation;
  geographicInformation: GeographicInformation;
  _id: string;
}

interface BusinessInformation {
  businessName: string;
  businessIndustry: string;
  idNumber: string;
  idExpiryDate: string | null;
  isIdVerified: boolean;
  phoneNumber: string;
}

interface GeographicInformation {
  country: string;
  city: string;
  lengthOfStay: number;
}

interface RequestedBy {
  firstName: string;
  lastName: string;
  middleName: string;
  id: string;
}


export interface RiskIntelligenceResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: RiskIntelligenceData;
  links: any[];
}

interface RiskIntelligenceData {
  latestReport: RiskReport;
  parentId: string | null;
  userId: string;
  type: string;
  ipAddress: string;
  latestRiskScore: number;
  latestAdverseMediaScore: number;
  latestRiskStatus: string;
  trackingInterval: number;
  trackingStatus: string;
  riskReportHistory: RiskReport[];
  _id: string;
  entityInformation: EntityInformation;
  businessId: string;
  requestedAt: string;
  requestedById: string;
  reportNextUpdateAt: string;
  reportlastUpdatedAt: string;
  createdAt: string;
  lastModifiedAt: string;
  _createdAt: string;
  _lastModifiedAt: string;
  enterpriseCode: number;
  allValidationPassed: boolean;
  id: string;
  metadata: Record<string, unknown>;
  requestedBy: RequestedBy;
}

interface RiskReport {
  geographic: GeographicRisk;
  product: ProductRisk;
  personal: PersonalRisk;
  basicRiskScore: number;
  previousRiskScore: number;
  riskScore: number;
  riskStatus: string;
  reportYear?: string | null;
  reportMonth: string;
  reportDay: string;
}

interface GeographicRisk {
  weight: number;
  country: string;
  countryScore: number;
  countryScoreStatus: string;
  city: string;
  cityScore: number;
  cityScoreStatus: string;
  lengthOfStayScore: number;
  lengthOfStayScoreStatus: string;
  phoneIntelligenceScore?: number;
  phoneIntelligenceScoreStatus?: string | null;
  actualScore: number;
  actualScoreOverallPercentage: number;
  actualScoreStatus: string;
  weightedScore: number;
}

interface ProductRisk {
  weight: number;
  industryScore: number;
  industryScoreStatus: string;
  occupationScore: number;
  occupationScoreStatus: string;
  actualScore: number;
  actualScoreOverallPercentage: number;
  actualScoreStatus: string;
  weightedScore: number;
}

interface PersonalRisk {
  weight: number;
  name: string;
  kycScore: number;
  kycScoreStatus: string;
  sanctionScore: number;
  sanctionScoreStatus: string;
  pepScore: number;
  pepScoreStatus: string;
  adverseMediaScore: number;
  adverseMediaScoreStatus: string;
  pAdverseMediaScore: number;
  pAdverseMediaScoreStatus: string;
  accountAgeScore: number;
  accountAgeScoreStatus: string;
  citizenshipScore: number;
  citizenshipScoreStatus: string;
  actualScore: number;
  actualScoreOverallPercentage: number;
  actualScoreStatus: string;
  weightedScore: number;
}

interface EntityInformation {
  personalInformation: PersonalInformation;
  geographicInformation: GeographicInformation;
  workInformation: WorkInformation;
  _id: string;
}

interface PersonalInformation {
  firstName: string;
  lastName: string;
  idNumber: string;
  idExpiryDate: string | null;
  isIdVerified: boolean;
  phoneNumber: string;
}

interface GeographicInformation {
  country: string;
  city: string;
  lengthOfStay: number;
}

interface WorkInformation {
  occupation: string;
  industry: string;
}

interface RequestedBy {
  firstName: string;
  lastName: string;
  middleName: string;
  id: string;
}


export interface IKYBCheck {
  registrationNumber: string;
  countryCode: CountryCode;
  registrationName?: string;
}

export interface KYBCheckResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    reason?: string;
    parentId: string | null;
    searchBusinessName: string | null;
    name: string;
    formerName: string | null;
    registrationNumber: string;
    registryNumber: string;
    vatNumber: string;
    registrationDate: string;
    registrationSubmissionDate: string;
    dateDisolved: string | null;
    tin: string;
    jtbTin: string | null;
    taxOffice: string | null;
    email: string;
    phone: string;
    websiteEmail: string | null;
    typeOfEntity: string;
    activity: string;
    address: string;
    state: string;
    lga: string;
    city: string;
    branchAddress: string;
    headOfficeAddress: string | null;
    objectives: string;
    status: string;
    companyStatus: string;
    isConsent: boolean;
    lastUpdatedAt: string;
    shareCapitalInWords: string;
    paidShareCapital: string;
    subscribedShareCapital: string;
    sharesValue: string;
    activityDescription: string;
    sharesIssued: string;
    parentCountry: string | null;
    companyContactPersons: {
      contacts: {
        email: string[];
        phone: string[];
      };
      name: string;
    }[];
    country: string;
    countryCode: string;
    keyPersonnel: {
      name: string;
      designation: string;
      isCorporate: boolean | null;
      appointedOn: string | null;
      resignedOn: string | null;
      sharesType: string | null;
      sharesValue: string | null;
      sharesCount: string | null;
      occupation: string | null;
      nationality: string | null;
      birthYear: number | null;
      birthMonth: number | null;
      birthDate: number | null;
      dateOfBirth: string | null;
      gender: string | null;
      address: string;
      countryOfResidence: string;
      number: string | null;
      isForeign: string;
      documentType: string | null;
      documentIssuedOn: string | null;
      documentIssuedBy: string | null;
      documentNumber: string | null;
      email: string | null;
      phone: string | null;
      status: string;
      companies: any[];
    }[];
    activities: any[];
    legalEntityIdentifierRegister: {
      leiCode: string;
      legalName: string;
      legalAddressFirstAddressLine: string;
      legalAddressAdditionalAddressLine1: string;
      legalAddressAdditionalAddressLine2: string;
      legalAddressAdditionalAddressLine3: string;
      legalAddressCity: string;
      legalAddressRegion: string;
      legalAddressCountry: string;
      legalAddressPostalCode: string;
      registrationAuthorityID: string;
      registrationAuthorityEntityID: string;
      legalJurisdiction: string;
      entityCategory: string;
      registrationInitialRegistrationDate: string;
      registrationLastUpdateDate: string;
      registrationNextRenewalDate: string;
      registrationManagingLOU: string;
      registrationValidationSources: string;
      validationAuthorityID: string;
      validationAuthorityEntityID: string;
      entityStatus: string;
      status: string;
    }[];
    centralIndexKeyRegister: {
      cik: string;
      entityType: string;
      sic: string;
      sicDescription: string;
      name: string;
      ein: string;
      description: string;
      website: string;
      investorWebsite: string;
      tickers: string[];
      stateOfIncorporation: string;
      businessAddressStreet1: string;
      mailingAddressCity: string;
      businessAddressStreet2: string | null;
      businessAddressCity: string;
      businessAddressStateOrCountry: string;
      businessAddressZipCode: string;
      businessAddressStateOrCountryDescription: string;
      phone: string;
      _id: string;
      formerNames: {
        from: string;
        to: string;
        name: string;
        _id: string;
      }[];
    }[];
    filings: {
      date: string;
      name: string;
      type: string;
      status: string | null;
    }[];
    affiliates: {
      name: string;
      brandName: string | null;
      shortName: string | null;
      companyNumber: string;
      countryCode: string;
    }[];
    businessId: string;
    type: string;
    requestedAt: string;
    requestedById: string;
    searchTerm: string;
    createdAt: string;
    lastModifiedAt: string;
    _createdAt: string;
    _lastModifiedAt: string;
    id: string;
    requestedBy: {
      firstName: string;
      lastName: string;
      middleName: string;
      id: string;
    };
  };
  links: any[];
}

