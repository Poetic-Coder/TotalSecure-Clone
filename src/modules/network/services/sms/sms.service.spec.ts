import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SmsService } from './sms.service';
import { CHANNEL, SMS_URL, TYPE } from './constants';
import { HttpService, HttpModule } from '@nestjs/axios';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

describe('SmsService', () => {
  let service: SmsService;
  let configService: ConfigService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
        HttpModule
      ],
      providers: [
        SmsService,
      ],
    })
      .compile();

    service = module.get<SmsService>(SmsService);
    configService = module.get<ConfigService>(ConfigService);
    httpService = module.get(HttpService);
    jest.spyOn(configService, 'get').mockImplementation(() => "test");
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send sms', async () => {
    const number = '1234567890'
    const message = 'test message'

    jest.spyOn(httpService.axiosRef, 'post').mockImplementation(() => Promise.resolve({ data: { message_id: '1234567890' } }));

    const sent = await service.send(number, message);
    expect(sent).toBeTruthy();
    expect(httpService.axiosRef.post).toBeCalledWith(
      SMS_URL, {
      to: number,
      sms: message,
      from: configService.get<string>('TERMII_SENDER_ID'),
      type: TYPE,
      api_key: configService.get<string>('TERMII_API_KEY'),
      channel: CHANNEL,
    }
    )
  });

});