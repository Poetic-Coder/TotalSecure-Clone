import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailgunModule } from 'nestjs-mailgun';
import { SmsService } from './services/sms/sms.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { NetworkController } from './network.controller';
import { HttpModule } from '@nestjs/axios';
import { EmailService, MailGunService, NodeMailerService } from './services/email/email.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }),
    MailgunModule.forAsyncRoot({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          username: configService.get('MAILGUN_USERNAME'),
          key: configService.get('MAILGUN_KEY'),
        };
      },
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        return {
          transport: {
            host: config.get('MAIL_HOST'),
            secure: config.get('MAIL_USE_SSL') === 'true' ? true : false,
            port: config.get('MAIL_PORT'),
            auth: {
              user: config.get('MAIL_USER'),
              pass: config.get('MAIL_PASSWORD'),
            },
          },
          defaults: {
            from: `"No Reply" <${config.get('MAIL_FROM')}>`,
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
  ],
  providers: [SmsService, EmailService, MailGunService, NodeMailerService],
  exports: [SmsService, EmailService],
  controllers: [NetworkController],
})
export class NetworkModule {}
