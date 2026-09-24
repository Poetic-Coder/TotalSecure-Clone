import {
  MiddlewareConsumer,
  Logger,
  Module,
  NestModule,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseModule } from '@database/database.module';
import { HashingModule } from './modules/hashing/hashing.module';
import * as session from 'express-session';
import * as RedisStore from 'connect-redis';
import Redis from '@redis/index';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { BullConfigService } from '@config/bull.config';
import { BackgroundModule } from '@modules/background/background.module';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CoreModule } from 'src/core/core.module';
import { NetworkModule } from '@modules/network/network.module';
import { ApiKeyMiddleware } from '@common/middlewares/api.middleware';
import { AuthenticationMiddleware } from '@common/middlewares/auth.middleware';
import { ApiClientModule } from '@modules/clients/clients.module';
import {
  APPZONE_WEBHOOK_URL,
  INTERSWITCH_CARD_UPDATE_URL,
  COMONO_DIGITAL_WEBHOOK_URL,
  COMONO_WEBHOOK_URL,
  VERIFY_ME_WEBHOOK_URL,
  WORKSPACE_PREFIX,
  YOUVERIFY_URL,
  OKHI_URL,
} from '@common/constants';
import { ScheduleModule } from '@nestjs/schedule/dist';
import { AdminUiModule } from '@modules/adminui/adminjs.module';
import { WebhookModule } from '@api/webhook/webhook.module';
import { EventModule } from '@api/events/events.module';
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from '@common/filters/http-exception.filter';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { SecurityModule } from '@modules/security/security.module';
import { KycModule } from '@api/kyc/kyc.module';
import { FirebaseModule } from '@modules/firebase/firebase.module';
import { ExternalMiddleware } from '@common/middlewares/external.middleware';
import { NotificationModule } from './api/notification/notification.module';
import { SupportModule } from '@api/support/support.module';
import { ApiKeyModule } from '@api/apikey/apiKey.module';
import { CommonAuthModule } from '@api/common/auth/common-auth.module';
import { CommonFilesModule } from '@api/common/files/common-files.module';
import { PlatformModule } from '@api/platform/platform.module';
import { CompanyModule } from '@api/company/company.module';
import { ClientModule } from '@api/client/client.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    CommonAuthModule,
    CommonFilesModule,
    PlatformModule,
    CompanyModule,
    ClientModule,
    HashingModule,
    BackgroundModule,
    NetworkModule,
    BullModule.forRootAsync({
      useClass: BullConfigService,
      imports: [ConfigModule],
    }),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
      boardOptions: {
        uiConfig: { boardTitle: 'Test' },
      },
    }),
    AdminUiModule,
    CoreModule,
    ApiClientModule,
    ScheduleModule.forRoot(),
    WebhookModule,
    EventModule,
    SecurityModule,
    KycModule,
    FirebaseModule,
    NotificationModule,
    SupportModule,
    ApiKeyModule,
  ],
  controllers: [AppController],
  providers: [
    BullConfigService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
        errorHttpStatusCode: 400,
        stopAtFirstError: true,
      }),
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    Logger,
  ],
})
export class AppModule implements NestModule {
  constructor(private readonly configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    const SessionStore = RedisStore(session);

    const publicAuthExcludes = [
      { path: 'platform/auth/login', method: RequestMethod.POST },
      { path: 'platform/auth/refresh', method: RequestMethod.POST },
      { path: 'platform/auth/logout', method: RequestMethod.POST },
      { path: 'platform/auth/forgot-password', method: RequestMethod.POST },
      { path: 'platform/auth/reset-password', method: RequestMethod.POST },
      { path: 'platform/auth/mfa/verify', method: RequestMethod.POST },
      { path: 'company/auth/login', method: RequestMethod.POST },
      { path: 'company/auth/guard/login', method: RequestMethod.POST },
      { path: 'company/auth/register', method: RequestMethod.POST },
      { path: 'company/auth/branding', method: RequestMethod.GET },
      { path: 'company/auth/refresh', method: RequestMethod.POST },
      { path: 'company/auth/logout', method: RequestMethod.POST },
      { path: 'company/auth/forgot-password', method: RequestMethod.POST },
      { path: 'company/auth/reset-password', method: RequestMethod.POST },
      { path: 'company/auth/mfa/verify', method: RequestMethod.POST },
      { path: 'client/auth/login', method: RequestMethod.POST },
      { path: 'client/auth/register', method: RequestMethod.POST },
      { path: 'client/auth/refresh', method: RequestMethod.POST },
      { path: 'client/auth/logout', method: RequestMethod.POST },
      { path: 'client/auth/forgot-password', method: RequestMethod.POST },
      { path: 'client/auth/reset-password', method: RequestMethod.POST },
      { path: 'client/auth/mfa/verify', method: RequestMethod.POST },
      { path: 'client/portal/login', method: RequestMethod.POST },
    ];

    consumer
      .apply(
        session({
          secret: this.configService.get('APP_SESSION_SECRET'),
          resave: false,
          saveUninitialized: false,
          store: new SessionStore({
            client: new Redis({
              port: this.configService.get('REDIS_PORT'),
              host: this.configService.get('REDIS_HOST'),
              password: this.configService.get('REDIS_PASSWORD'),
            }),
            logErrors: true,
          }),
        }),
      )
      .forRoutes('*')

      .apply(ApiKeyMiddleware)
      .exclude(
        { path: `queues`, method: RequestMethod.ALL },
        {
          path: `webhook/${VERIFY_ME_WEBHOOK_URL}`,
          method: RequestMethod.POST,
        },
        {
          path: `webhook/${COMONO_DIGITAL_WEBHOOK_URL}`,
          method: RequestMethod.POST,
        },
        { path: `webhook/${COMONO_WEBHOOK_URL}`, method: RequestMethod.POST },
        { path: `webhook/${APPZONE_WEBHOOK_URL}`, method: RequestMethod.POST },
        { path: 'kyc/get-states', method: RequestMethod.GET },
        { path: 'kyc/get-lgas/*', method: RequestMethod.GET },
        { path: `api/(.*)`, method: RequestMethod.ALL },
        { path: `queues/(.*)`, method: RequestMethod.ALL },
        { path: `admin-dashboard/(.*)`, method: RequestMethod.ALL },
        {
          path: `webhook/${INTERSWITCH_CARD_UPDATE_URL}`,
          method: RequestMethod.POST,
        },
        { path: `webhook/${YOUVERIFY_URL}`, method: RequestMethod.POST },
        { path: `webhook/${OKHI_URL}`, method: RequestMethod.POST },
        { path: `webhook/agent-approval`, method: RequestMethod.POST },
        ...publicAuthExcludes,
      )
      .forRoutes('*')

      .apply(AuthenticationMiddleware)
      .exclude(
        { path: `queues`, method: RequestMethod.ALL },
        ...publicAuthExcludes,
        { path: 'file-upload/upload/single', method: RequestMethod.POST },
        { path: 'file-upload/upload/multiple', method: RequestMethod.POST },
        { path: 'kyc/get-states', method: RequestMethod.GET },
        { path: 'kyc/get-lgas/*', method: RequestMethod.GET },
        { path: `admin-dashboard/(.*)`, method: RequestMethod.ALL },
        { path: `${WORKSPACE_PREFIX}/(.*)`, method: RequestMethod.ALL },
        { path: `app/(.*)`, method: RequestMethod.ALL },
        { path: `network/(.*)`, method: RequestMethod.ALL },
        { path: `webhook/(.*)`, method: RequestMethod.ALL },
        { path: `events/(.*)`, method: RequestMethod.ALL },
        { path: `api/(.*)`, method: RequestMethod.ALL },
        { path: `queues/(.*)`, method: RequestMethod.ALL },
      )
      .forRoutes('*')

      .apply(ExternalMiddleware);
  }
}
