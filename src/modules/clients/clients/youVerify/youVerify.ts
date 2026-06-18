import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  FormData,
  PhysicalAddressDto,
  Transaction,
  ITransactionResponse,
  EvaluationResponse,
  IamlSearch,
  AmlResponse,
  SearchBy,
  RiskVerification,
  ICreateRiskReportResponse,
  RiskIntelligenceResponse,
  IKYBCheck,
  KYBCheckResponse
} from '../interfaces/youVerify/youVerify.dto';
import { KycService } from '@api/kyc/kyc.service';
@Injectable()
export class YouVerifyService {
  private readonly baseUrl: string;
  private readonly secretKey: string;
  private readonly logger = new Logger(YouVerifyService.name);
  private readonly kycService: KycService;
  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('YOU_VERIFY_BASE_URL');
    this.secretKey = this.configService.get<string>('YOU_VERIFY_SECRET_KEY');
  }
  public async verifyBvnRegistration(bvnNumber: string): Promise<any> {
    const url = `${this.baseUrl}/v2/api/identity/ng/bvn`;
    const headers = {
      token: this.secretKey,
      'Content-Type': 'application/json',
    };
    const body = {
      id: bvnNumber,
      isSubjectConsent: true,
    };
    const response = await axios.post(url, body, { headers });
    const result = response.data;
    this.logger.debug(result);
    if (!result.success) {
      this.logger.error(result);
      throw new BadRequestException('Unable to verify BVN number');
    }
    return result;
  }

  public async verifyPhysicalAddress(data: PhysicalAddressDto): Promise<any> {
    let candidateId: string;
    try {
      if (data.type && data.idNumber) {
        return new BadRequestException("Only form type accepted for now");
        //const candidate = await this.createCandidateByIdentity(data.type, data.idNumber);
        //candidateId = candidate.data.id; 
      } else if (data.formData) {
        // TODO: Add proper form data type
        const formData = data.formData;
        const candidate = await this.createCandidate(formData);
        candidateId = candidate.data.id;
      }

      const url = `${this.baseUrl}/v2/api/addresses/individual/request`;

      const headers = {
        token: this.secretKey,
        'Content-Type': 'application/json',
      };

      const body = {
        candidateId: candidateId,
        address: data.address,
        subjectConsent: true,
      };
      const response = await axios.post(url, body, { headers });
      const result = response.data;
      this.logger.debug(result);
      if (!result.success) {
        this.logger.error(result);
        throw new BadRequestException(result.message || 'Unable to verify Address');
      }
      return result;
    } catch (error) {
      this.logger.error('Error verifying physical address:', error.message);
      if (error.response) {
        this.logger.error('Response error:', error.response.data);
        throw new BadRequestException(error.response.data.message || 'Bad request');
      } else {
        throw error;
      }

    }
  }

  public async createCandidateByIdentity(type: string, idNumber: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/v2/api/addresses/candidates/identity`;

      const headers = {
        token: this.secretKey,
        'Content-Type': 'application/json',
      };

      const body = {
        type,
        idNumber,
        subjectConsent: true,
      };

      const response = await axios.post(url, body, { headers });
      const result = response.data;

      this.logger.debug(result);
      if (!result.success) {
        this.logger.error(result);
        throw new BadRequestException('Unable to create candidate by identity');
      }
      return result;
    } catch (error) {
      if (error.response) {
        this.logger.error('Response error:', error.response.data);
      } else {
        this.logger.error('Request error:', error.message);
      }
      throw error;
    }

  }

  public async createCandidate(data: FormData): Promise<any> {
    try {
      const url = `${this.baseUrl}/v2/api/addresses/candidates`;

      const headers = {
        token: this.secretKey,
        'Content-Type': 'application/json',
      };

      const response = await axios.post(url, data, { headers });
      const result = response.data;

      this.logger.debug(result);
      if (!result.success) {
        this.logger.error(result);
        throw new BadRequestException('Unable to create candidate');
      }
      return result;
    } catch (error) {
      if (error.response) {
        this.logger.error('Response error:', error.response.data);
      } else {
        this.logger.error('Request error:', error.message);
      }
      throw error;
    }
  }


  public async retrieveAddressVerification(idYouVerifyAddress: any): Promise<any> {
    try {
      const url = `${this.baseUrl}/v2/api/addresses/${idYouVerifyAddress}`;

      const headers = {
        token: this.secretKey,
        'Content-Type': 'application/json',
      };

      const response = await axios.get(url, { headers });
      return response.data.data;

    } catch (error) {
      if (error.response) {
        this.logger.error('Response error:', error.response.data);
      } else {
        this.logger.error('Request error:', error.message);
      }
      throw error;
    }
  }


  public async createTransactionKYT(transaction: Transaction): Promise<ITransactionResponse> {
    const { transactionReference, transactionDate, direction, currency, amount, purpose, instrument, countryCode, source, beneficiary } = transaction;
    const errMessage = 'Unable to evaluate the transaction'
    try {
      const transactionTimestamp = Math.floor(transactionDate.getTime() / 1000)
      const url = `${this.baseUrl}/v1/api/evaluations`;

      const headers = {
        token: this.secretKey,
        'Content-Type': 'application/json',
      };


      const body = {
        transactionReference,
        transactionDate: transactionTimestamp,
        direction,
        currency,
        amount,
        localAmount: 0,
        purpose,
        instrument,
        countryCode,
        source: {
          accountNumber: source.accountNumber,
          accountHolderType: source.accountHolderType,
          accountName: source.accountName,
          bankName: source.bankName,
          bankCode: source.bankCode
        },
        beneficiary: {
          accountHolderType: beneficiary.accountHolderType,
          accountNumber: beneficiary.accountNumber,
          accountName: beneficiary.accountName,
          bankName: beneficiary.bankName,
          countryCode: beneficiary.countryCode,
          bankCode: beneficiary.bankCode
        },
        metadata: {}
      };



      const response = await axios.post(url, body, { headers });
      const result = response.data;

      this.logger.debug(result);
      if (!result.success) {
        this.logger.error(result);
        throw new BadRequestException(errMessage);
      }
      return result;
    } catch (error) {
      console.log(error)
      if (error.response) {
        this.logger.error('Response error:', error.response.data);
      } else {
        this.logger.error('Request error:', error.message);
      }
      throw new BadRequestException(errMessage);
    }

  }

  public async evaluateTransactionKYT(): Promise<EvaluationResponse> {

    const errMessage = 'Unable to get transaction evaluation'
    try {

      const url = `${this.baseUrl}/v1/api/evaluations`;

      const headers = {
        token: this.secretKey,
        'Content-Type': 'application/json',
      };

      const response = await axios.get(url, { headers });

      const result = response.data;

      this.logger.debug(result);

      if (!result.success) {
        this.logger.error(result);
        throw new BadRequestException(errMessage);
      }
      return result;
    } catch (error) {
      console.log(error)
      if (error.response) {
        this.logger.error('Response error:', error.response.data);
      } else {
        this.logger.error('Request error:', error.message);
      }
      throw new BadRequestException(errMessage);
    }

  }

  public async amlSearch(searchPayload: IamlSearch): Promise<AmlResponse> {
    const {
      type,
      query,
      isSubjectConsent,
      advancedSearch,
      searchBy
    } = searchPayload;
    const errMessage = 'The search failed'
    try {

      let url = `${this.baseUrl}/v2/api/verifications/advanced/name/aml-checks`;

      if (searchBy === SearchBy.identity) {
        url = `${this.baseUrl}/v2/api/verifications/advanced/identity/aml-checks`;
      }

      const headers = {
        token: this.secretKey,
        'Content-Type': 'application/json',
      };


      const payload = {
        type, // Using the enum
        query,
        isSubjectConsent,
        advancedSearch,
      };



      const response = await axios.post(url, payload, { headers });
      const result = response.data;

      this.logger.debug(result);
      if (!result.success) {
        this.logger.error(result);
        throw new BadRequestException(errMessage);
      }
      return result;
    } catch (error) {
      console.log(error)
      if (error.response) {
        this.logger.error('Response error:', error.response.data);
      } else {
        this.logger.error('Request error:', error.message);
      }
      throw new BadRequestException(errMessage);
    }

  }

  public async createRiskCheck(riskPayload: RiskVerification): Promise<ICreateRiskReportResponse> {
    const {
      type,
      firstName,
      isSubjectConsent,
      lastName,
      businessName,
      businessIndustry,
      country,
      city,
      advanceOptions
    } = riskPayload;
    const errMessage = 'Failed to create risk check'
    try {

      const url = `${this.baseUrl}/v2/api/identity/risk-check/initialize`;



      const headers = {
        token: this.secretKey,
        'Content-Type': 'application/json',
      };


      const payload = {
        type,
        firstName,
        isSubjectConsent,
        lastName,
        businessName,
        businessIndustry,
        country,
        city,
        advanceOptions
      };



      const response = await axios.post(url, payload, { headers });
      const result = response.data;

      this.logger.debug(result);
      if (!result.success) {
        this.logger.error(result);
        throw new BadRequestException(errMessage);
      }
      return result;
    } catch (error) {
      console.log(error)
      if (error.response) {
        this.logger.error('Response error:', error.response.data);
      } else {
        this.logger.error('Request error:', error.message);
      }
      throw new BadRequestException(errMessage);
    }

  }

  public async getEntityRisk(entityId: string): Promise<RiskIntelligenceResponse> {

    const errMessage = 'Failed to get entity risk details'
    try {

      const url = `${this.baseUrl}/v2/api/identity/risk-check/entities/${entityId}`;



      const headers = {
        token: this.secretKey,
        'Content-Type': 'application/json',
      };


      const response = await axios.post(url, { headers });
      const result = response.data;

      this.logger.debug(result);
      if (!result.success) {
        this.logger.error(result);
        throw new BadRequestException(errMessage);
      }
      return result;
    } catch (error) {
      console.log(error)
      if (error.response) {
        this.logger.error('Response error:', error.response.data);
      } else {
        this.logger.error('Request error:', error.message);
      }
      throw new BadRequestException(errMessage);
    }

  }

  public async KYBCheck(businessInfo: IKYBCheck): Promise<any> {
    const {
      registrationNumber,
      countryCode,
      registrationName
    } = businessInfo;
    const errMessage = 'Failed to get business info'
    try {

      const url = `${this.baseUrl}/v2/api/verifications/global/company-advance-check`;

      const headers = {
        token: this.secretKey,
        'Content-Type': 'application/json',
      };


      const payload = {
        registrationNumber,
        countryCode,
        isConsent: true,
      };

      const NODE_ENV = this.configService.get<string>('NODE_ENV');

      let response;


      
      if(NODE_ENV === 'development') {
        return {
          verified: true,
          data: {
            name: "IT Service",
            headOfficeAddress: "1 Road, Lekki phase one",
            state: "Lagos"
          },
        }
      } else {
        response = await axios.post(url, payload, { headers });
      const result: KYBCheckResponse = response.data;

      this.logger.debug(result);
      if (!result.success) {
        this.logger.error(result);
        throw new BadRequestException(errMessage);
      }

      if (result.data?.reason) {
        throw new BadRequestException('Company details not found');
      }


      return {
        data: result.data, verified: true
      };

      }
      
      
      
    } catch (error) {
      if (error.response) {
        this.logger.error('Response error:', error.response.data);
      } else {
        this.logger.error('Request error:', error.message);
      }
      throw new BadRequestException(error.response?.data?.data[0]?.message || errMessage);
    }

  }


  public async verifyBvn({ lastName, firstName, bvnNumber, selfie }: { bvnNumber: string, firstName: string, lastName: string, selfie?: string }): Promise<any> {
    const url = `${this.baseUrl}/v2/api/identity/ng/bvn`;
    const body = {
      id: bvnNumber,
      isSubjectConsent: true,
      validations: {
        data: {
          lastName,
          firstName
        }
      }
    };

    if(selfie) {
      body.validations["selfie"] = {
        image: selfie
    }
    }

    const result = await this.handleIdValidation({ url, body, errorMessage: 'Unable to verify BVN number' })

    return result;
  }

  private checkValidations(iDValidationResponse: any, validateLastname?: boolean) {
    const resData = iDValidationResponse?.validations?.data;

    const selfie = iDValidationResponse?.validations?.selfie
    let message;
    const NODE_ENV = this.configService.get('NODE_ENV');
    const isDev = NODE_ENV === 'development';
    if(selfie && (!selfie?.selfieVerification?.match && !isDev) ) {
      message = "Provided facial image does not match"
      throw new BadRequestException(message)
    }
    const validatedInfo = validateLastname ? (resData?.firstName?.validated && resData?.lastName?.validated) : resData?.firstName?.validated
  
    if (validatedInfo) {
      return {
        verified: true,
        data: iDValidationResponse,
      };
    } else {
      
      if (!resData?.firstName?.validated) {
        message = "Your firstname does not match ID data"
      };
      if (!resData?.lastName?.validated && validateLastname) {
        message = "Your surname does not match ID data"
      };
      throw new BadRequestException(message)
    }
  }

  public async handleIdValidation({ body, url, errorMessage, validateLastname=true }: { body: any, url: string, errorMessage: string,  validateLastname?: boolean}) {
    try {
      const headers = {
        token: this.secretKey,
        'Content-Type': 'application/json',
      };

      const response = await axios.post(url, body, { headers });
      const result = response.data;
      this.logger.debug(result);
      if (!result.success) {
        this.logger.error(result);
        throw new BadRequestException(errorMessage);
      }      
      return this.checkValidations(result?.data, validateLastname);
      
    } catch (error) {
      const data = error.response.data;
      const errMessage = error?.response?.message
      if (data) {
        this.logger.error(data || errMessage);
      } else {
        this.logger.error(error || errMessage);
      }
      throw new BadRequestException(errMessage || data?.message);
    }

  }


  public async verifyDriverLicense({ lastName, firstName, idNumber, selfie }: { lastName: string, firstName: string, idNumber: string, selfie?: string }): Promise<any> {
    const url = `${this.baseUrl}/v2/api/identity/ng/drivers-license`;
    const body = {
      id: idNumber,
      isSubjectConsent: true,
      validations: {
        data: {
          lastName,
          firstName
        }
      }
    };

    if(selfie) {
      body.validations["selfie"] = {
        image: selfie
    }
  }
    const result = await this.handleIdValidation({ url, body, errorMessage: 'Unable to verify driver license' })

    return result;
  }


  public async verifyIntPassport({ lastName, firstName, idNumber, selfie}: { lastName: string, firstName: string, idNumber: string, selfie?: string }): Promise<any> {
    const url = `${this.baseUrl}/v2/api/identity/ng/passport`;
    const body = {
      id: idNumber,
      lastName,
      isSubjectConsent: true,
      validations: {
        data: {
          firstName
        }
      }
    };

    if(selfie) {
      body.validations["selfie"] = {
        image: selfie
    }
  }

    const result = await this.handleIdValidation({ url, body, errorMessage: 'Unable to verify International passport', validateLastname: false })

    return result;
  }

  public async verifyVotersCard({ lastName, firstName, idNumber, dob, selfie }: { lastName: string, firstName: string, idNumber: string, dob: string, selfie?: string }): Promise<any> {
    const url = `${this.baseUrl}/v2/api/identity/ng/pvc`;
    const body = {
      id: idNumber,
      isSubjectConsent: true,
      validations: {
        data: {
          lastName,
          firstName,
          dateOfBirth: dob
        }
      }
    };

    if(selfie) {
      body.validations["selfie"] = {
        image: selfie
    }
  }

    const result = await this.handleIdValidation({ url, body, errorMessage: 'Unable to verify voters card' })

    return result;
  }

  public async verifyNIN({ lastName, firstName, idNumber, selfie }: { lastName: string, firstName: string, idNumber: string, selfie?: string }): Promise<any> {
    const url = `${this.baseUrl}/v2/api/identity/ng/nin`;
    const body = {
      id: idNumber,
      isSubjectConsent: true,
      validations: {
        data: {
          lastName,
          firstName
        }
      }
    };

    if(selfie) {
      body.validations["selfie"] = {
        image: selfie
    }
  }

    
    const result = await this.handleIdValidation({ url, body, errorMessage: 'Unable to verify VNIN' })

    return result;
  }

}