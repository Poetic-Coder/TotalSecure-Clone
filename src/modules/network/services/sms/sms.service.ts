import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CHANNEL, SMS_URL, TYPE } from '../../constants';
import { HttpService } from '@nestjs/axios';

type TermiiResponse = {
  message_id: string;
  message: string;
  balance: number;
  user: string;
}


@Injectable()
export class SmsService {

  private readonly logger = new Logger(SmsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) { }

  public async send(number: string, message: string) {
    const senderId = this.configService.get<string>('TERMII_SENDER_ID');
    return this.send_sms(number, message, senderId)
  }

  public async send_sms(to: string, message: string, from: string, channel = CHANNEL) {
    const data = {
      type: TYPE,
      api_key: this.configService.get<string>('TERMII_API_KEY'),
    }

    //Send POST Request to Termii's API
    const response = this.httpService.axiosRef.post<TermiiResponse>(SMS_URL, {
        to,
        sms: message,
        from,
        ...data,
        channel,
      }
    ).then((res) => {
      this.logger.debug(`SMS sent to ${to}`);
      return res.data
    }).catch((err) => {
      this.logger.error(`SMS not sent to ${to}`);
      this.logger.debug(err)
    })
    return response
	}

  public async sendBroadcast(numbers: any, message: string) {
    const senderId = this.configService.get<string>('TERMII_SENDER_ID');
    return this.send_sms(numbers, message, senderId)
  }
}

