import { Injectable } from '@nestjs/common/decorators';
import { ConfigService } from '@nestjs/config';
import { BaseApiClient, RequestOption } from '..';
import { Logger } from '@nestjs/common/services';
import {
  ComonoAddressRequest,
  ComonoAddressRequestData,
  ComonoAddressRequestResponse,
  LgaObject,
  StateObject,
} from './client.dto';

interface ComonoDigitalCreate {
  workitemId: string;
  customerName: string;
  address: string;
  landmark: string;
  state: string;
  lga: string;
  customerImage?: string;
  latitude: number;
  longitude: number;
  phoneNumber: string;
}

@Injectable()
export class ComonoDigitalClient extends BaseApiClient {
  private readonly logger = new Logger(ComonoDigitalClient.name);

  constructor(private readonly configService: ConfigService) {
    const baseUrl = configService.get('COMONO_DIGITAL_BASE_API_URL');
    super(baseUrl, {});
  }

  getRedirectUrl(data: ComonoDigitalCreate) {
    return this.buildUrl('/', {
      query: {
        WorkitemId: data.workitemId,
        CustomerName: data.customerName,
        Address: data.address,
        Landmark: data.landmark,
        State: data.state,
        Lga: data.lga,
        PhoneNumber: data.phoneNumber,
        ApiKey: this.configService.get('COMONO_API_KEY'),
        Latitude: data.latitude,
        Longitude: data.longitude,
      },
    });
  }
}

@Injectable()
export class ComonoClient extends BaseApiClient {
  private readonly logger = new Logger(ComonoClient.name);

  constructor(private readonly configService: ConfigService) {
    const baseUrl = configService.get('COMONO_BASE_API_URL');
    super(baseUrl, {});
  }

  /**
   * This method is used to verify a user's address
   *
   * @param uid this should be the user's id
   * @param data address verify request data
   */
  public async verifyAddress(uid: string, data: ComonoAddressRequest) {
    const result = await this.post<ComonoAddressRequestResponse>(
      'AddressVerification/createnewrequest',
      {
        body: {
          workitemId: uid,
          ...data,
        },
        headers: {
          Authorization: `Bearer ${await this.configService.get(
            'COMONO_API_KEY',
          )}`,
        },
      },
    );

    return result;
  }

  public async getAddressRequest(requestId: string) {
    const result = await this.get<ComonoAddressRequestData>(
      `AddressVerification/getrequestdetails/${requestId}`,
    );

    if (result.success) {
      return result.result;
    }

    this.logger.error('Error calling the comono api');
    this.logger.error(result);
    throw new Error('Error calling the comono api');
  }

  public async getStateList() {
    const result = await this.get<StateObject[]>('options/getstatelist');

    if (result.success) {
      return result.result;
    }

    this.logger.error('Error calling the comono api');
    this.logger.error(result);
    throw new Error('Error calling the comono api');
  }

  public async getLgaList(stateCode: string) {
    const result = await this.get<LgaObject[]>(
      `options/getlgabystate/${stateCode}`,
    );

    if (result.success) {
      return result.result;
    }

    this.logger.error('Error calling the comono api');
    this.logger.error(result);
    throw new Error('Error calling the comono api');
  }
}
