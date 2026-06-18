import { Inject, Injectable } from '@nestjs/common/decorators';
import { ConfigService } from '@nestjs/config';
import { BaseApiClient, RequestOption } from '..';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/common';
import {
  BvnDto,
  DriverLicence,
  FaceMatchDto,
  NationalPassport,
  PhysicalAddress,
  VNin,
  VotersCard,
} from '../interfaces/verifyMe/verifyme.dto';
import {
  BvnResponse,
  CacResponse,
  DriverLicenceResponse,
  FaceMatchResponse,
  NationalPassportResponse,
  OAuthResponse,
  PhysicalAddressResponse,
  VNinResponse,
  VotersCardResponse,
} from '../interfaces/verifyMe/verifyme';
import { Logger } from '@nestjs/common/services';
import * as crypto from 'crypto';
import { DynamicObject } from '@common/interfaces';
import { joinUrls } from '@common/utils/urls';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class VerifyMeClient extends BaseApiClient {
  @Inject(CACHE_MANAGER)
  private cacheManager: Cache;
  private readonly logger = new Logger(VerifyMeClient.name);

  private version: string;
  private WEBHOOK_SECRET: string;
  private ignoreVersionPaths = {
    token: true,
  };

  constructor(private readonly configService: ConfigService) {
    const baseUrl = configService.get('VERIFY_ME_BASE_URL');
    super(baseUrl, {});
    this.version = configService.get('VERIFY_ME_VERSION');
    this.WEBHOOK_SECRET = configService.get('VERIFY_ME_WEBHOOK_SECRET');
  }

  public ignoreVersion(path: string) {
    const val = this.ignoreVersionPaths[path];
    return val === undefined;
  }

  public async getToken() {
    const token = await this.cacheManager.get<string>('verifyMeToken');
    if (token) {
      return token;
    }
    const { accessToken, expiresIn } = await this.getOauthToken();
    await this.setToken(accessToken, expiresIn);
    return accessToken;
  }

  public async setToken(token: string, expiresIn: number) {
    // TODO: is expiresIn in seconds or milliseconds?
    return this.cacheManager.set('verifyMeToken', token, expiresIn);
  }

  public async buildHeaders(context: Pick<RequestOption, 'headers' | 'path'>) {
    const headers = super.buildHeaders(context);
    if (context.path === 'token') {
      return headers;
    }
    return {
      ...headers,
      Authorization: `Bearer ${await this.getToken()}`,
    };
  }

  public buildUrl(
    path: string,
    context: Pick<RequestOption, 'params' | 'query'>,
  ) {
    if (this.ignoreVersion(path)) {
      path = joinUrls(this.version, path);
    }
    return super.buildUrl(path, context);
  }

  public async getOauthToken() {
    const clientId = this.configService.get('VERIFY_ME_CLIENT_ID');
    const clientSecret = this.configService.get('VERIFY_ME_SECRET_KEY');
    const data = {
      clientId: clientId,
      secret: clientSecret,
    };
    const response = await this.post<OAuthResponse>('token', {
      body: data,
    });
    if (response.success) {
      return response.result;
    }
    this.logger.error(response);
    throw new BadRequestException('Unable to get token from verify me');
  }

  public async verifyPhysicalAddress(data: PhysicalAddress) {
    const response = await this.post<PhysicalAddressResponse>('addresses', {
      body: {
        street: data.street,
        lgaName: data.lga,
        stateName: data.state,
        landmark: data.landmark,
        city: data.city,
        customerReference: data.userId,
        firstname: data.firstName,
        lastname: data.lastName,
        phoneNumber: data.phone,
      },
    });
    if (response.success) {
      return response.result;
    }
    this.logger.error(response);
    throw new BadRequestException('Unable to verify physical address');
  }

  public async verifyDriverLicense(data: DriverLicence) {
    const result = await this.post<DriverLicenceResponse>(
      'identities/drivers-license/{idNumber}/',
      {
        params: {
          idNumber: data.idNumber,
        },
        body: {
          firstname:  data.firstName,
            lastname:  data.lastName,
             //phone:  data.phone,
        },
      },
    );


    if (result.success) {
      if (
        result.result.status.state === 'complete' &&
        result.result.status.status === 'verified'
      ) {
        return {
          verified: true,
          data: result.result,
        };
      }
      return {
        verified: false,
        data: result.result,
      };
    }
    this.logger.error(result);
    throw new BadRequestException('Unable to verify driver licence');
  }

  public async verifyVoterCard(data: VotersCard) {
    const result = await this.post<VotersCardResponse>(
      'identities/vin/{vin}/',
      {
        params: {
          vin: data.idNumber,
        },
        body: {
          firstname: data.firstName,
          lastname: data.lastName,
          dob: data.dob,
          phoneNumber: data.phone,
        },
      },
    );
    if (result.success) {
      if (
        result.result.status.state === 'complete' &&
        result.result.status.status === 'verified'
      ) {
        return {
          verified: true,
          data: result.result,
        };
      }
      return {
        verified: false,
        data: result.result,
      };
    }
    this.logger.error(result);
    throw new BadRequestException('Unable to verify voter card');
  }

  public async verifyVirtualNin(data: VNin) {
    const result = await this.post<VNinResponse>(
      'identities/virtual-nin/{vNIN}/',
      {
        params: {
          vNIN: data.idNumber,
        },
        body: {
          firstname: data.firstName,
          lastname: data.lastName,
        },
      },
    );
    if (result.success) {
      if (
        result.result.status.state === 'complete' &&
        result.result.status.status === 'verified'
      ) {
        return {
          verified: true,
          data: result.result,
        };
      }
      return {
        verified: false,
        data: result.result,
      };
    }
    this.logger.error(result);
    throw new BadRequestException('Unable to verify virtual nin');
  }

  public async verifyBvn(data: BvnDto) {
    const result = await this.post<BvnResponse>(
      'identities/bvn-basic/{idNumber}/',
      {
        params: {
          idNumber: data.idNumber,
        },
        body: {
          firstname: data.firstName,
          lastname: data.lastName,
        },
      },
    );
    this.logger.debug(result);
    if (result.success) {
      if (
        result.result.status.state === 'complete' &&
        result.result.status.status === 'verified'
      ) {
        return {
          verified: true,
          data: result.result,
        };
      }
      return {
        verified: false,
        data: result.result,
      };
    }
    this.logger.error(result);
    throw new BadRequestException('Unable to verify bvn number');
  }

  public async verifyPassport(data: NationalPassport) {
    const result = await this.post<NationalPassportResponse>(
      'identities/passport/{passportNumber}/',
      {
        params: {
          passportNumber: data.idNumber,
        },
        body: {
          firstname: data.firstName,
          lastname: data.lastName,
          dob: data.dob,
        },
      },
    );

    if (result.success) {
      if (
        result.result.status.state === 'complete' &&
        result.result.status.status === 'verified'
      ) {
        return {
          verified: true,
          data: result.result,
        };
      }
      return {
        verified: false,
        data: result.result,
      };
    }
    this.logger.error(result);
    throw new BadRequestException('Unable to verify passport');
  }

  public async faceMatch(data: FaceMatchDto) {
    const { idType, idNumber, photoUrl } = data;
    const result = await this.post<FaceMatchResponse>(
      'identities/face-verification/{idType}/',
      {
        params: {
          idType,
        },
        body: {
          idNumber,
          photoUrl,
        },
      },
    );
    if (result.success) {
      if (
        result.result.status.state === 'complete' &&
        result.result.status.status === 'verified'
      ) {
        return {
          verified: true,
          data: result.result,
        };
      }
      return {
        verified: false,
        data: result.result,
      };
    }
    this.logger.error(result);
    throw new BadRequestException('Unable to verify id card face match');
  }

  public async verifyNin(data: VNin) {
    const result = await this.post<VNinResponse>('identities/nin/{idNumber}/', {
      params: {
        idNumber: data.idNumber,
      },
      body: {
        firstname: data.firstName,
        lastname: data.lastName,
      },
    });

    if (result.success) {
      if (
        result.result.status.state === 'complete' &&
        result.result.status.status === 'verified'
      ) {
        return {
          verified: true,
          data: result.result,
        };
      }
      return {
        verified: false,
        data: result.result,
      };
    }
    this.logger.error(result);
    throw new BadRequestException('Unable to verify nin');
  }

  public async verifyCac(regNumber: string) {
    const result = await this.post<CacResponse>('identities/cac-basic/', {
      body: {
        regNumber,
      },
    });
    if (result.success) {
      if (
        result.result.status.state === 'complete' &&
        result.result.status.status === 'verified'
      ) {
        return {
          verified: true,
          data: result.result,
        };
      }
      return {
        verified: false,
        data: result.result,
      };
    }
    this.logger.error(result);
    throw new BadRequestException('Unable to verify cac');
  }

  /**
   *
   * @example
   *
   * const signature = request.headers['x-verifyme-signature']
   * const payload = request.body
   *
   * const isValid = await verifyme.validateWebhookPayload(signature, payload)
   *
   * if (isValid) {
   * // do something
   * }
   *
   * @param signature
   * @param payloadBody
   * @returns
   */
  public async validateWebhookPayload(
    signature: string,
    payloadBody: DynamicObject,
  ) {
    const hash = crypto.createHmac('sha512', this.WEBHOOK_SECRET);
    const token = hash.update(JSON.stringify(payloadBody)).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(signature));
  }
}
