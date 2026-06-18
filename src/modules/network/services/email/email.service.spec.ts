import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailgunModule, MailgunService } from 'nestjs-mailgun';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { EmailService } from './email.service';


describe('EmailService', () => {
  let service: EmailService;
  let mailgunService: MailgunService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
        MailgunModule.forRoot({
          username: "test",
          key: "test",
        }),
        MailerModule.forRoot({
          transport: {
            host: "test",
            auth: {
              user: "test",
              pass: "test",
            },
          },
          defaults: {
            from: "No Reply <test>",
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        }),
      ],
      providers: [],
    })
      .compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);
    mailgunService = module.get<MailgunService>(MailgunService);
    jest.spyOn(mailgunService, 'createEmail').mockResolvedValue({
      status: 200,
    });
    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      switch (key) {
        case 'MAILGUN_FROM':
          return 'test@test.com';
        case 'MAILGUN_DOMAIN':
          return 'test.com';
        default:
          return 'test';
      }
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send email', async () => {
    const email = 'test@gmail.com'
    const subject = 'test subject'
    const message = 'test message'
    const sent = await service.sendOtp(email, {
      name: 'test',
      otp: '123456',
    });
    expect(sent).toBeTruthy();
    expect(mailgunService.createEmail).toBeCalledWith(
      configService.get<string>('MAILGUN_DOMAIN'),
      {
        from: configService.get<string>('MAILGUN_FROM'),
        to: email,
        subject: subject,
        text: message,
      }
    )
  });

});