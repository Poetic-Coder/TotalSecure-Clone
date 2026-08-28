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
import { AuthenticationModule } from '@api/authentication/authentication.module';
import { HashingModule } from './modules/hashing/hashing.module';
import { UserModule } from './api/user/user.module';
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
import {
  AuthenticationMiddleware,
} from '@common/middlewares/auth.middleware';
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
import { BusinessAuthModule } from '@api/business-auth/business-auth.module';


@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    BusinessAuthModule,
    AuthenticationModule,
    HashingModule,
    UserModule,
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
        uiConfig: {boardTitle: "Test"},
        
      }
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
    ApiKeyModule
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

      // Api Key Middleware
      .apply(ApiKeyMiddleware)
      .exclude(
        //{ path: 'transfer/interbank-test', method: RequestMethod.POST },
        //{ path: 'thebank/name-enquiry', method: RequestMethod.POST },
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
        { path: `webhook/${INTERSWITCH_CARD_UPDATE_URL}`, method: RequestMethod.POST },
        { path: `webhook/${YOUVERIFY_URL}`, method: RequestMethod.POST },
        { path: `webhook/${OKHI_URL}`, method: RequestMethod.POST },
        { path: `webhook/agent-approval`, method: RequestMethod.POST },
        { path: 'business-auth/register', method: RequestMethod.POST },
        { path: 'business-auth/verify', method: RequestMethod.POST },
        { path: 'business-auth/forgot-password', method: RequestMethod.POST },
        { path: 'business-auth/reset-password', method: RequestMethod.POST },
        // Exclude all routes that start with /EXTERNAL_PREFIX
      )
      .forRoutes('*')

      // Authentication Middleware
      .apply(AuthenticationMiddleware)
      .exclude(
        //{ path: 'transfer/interbank-test', method: RequestMethod.POST },
        { path: `queues`, method: RequestMethod.ALL },
        { path: 'auth/login/customer', method: RequestMethod.POST },
        { path: 'auth/login/agent', method: RequestMethod.POST },
        { path: 'auth/login/staff', method: RequestMethod.POST },
        { path: 'auth/login/guard', method: RequestMethod.POST },
        { path: 'auth/register/agent', method: RequestMethod.POST },
        { path: 'auth/register/customer', method: RequestMethod.POST },
        { path: 'auth/forget-password', method: RequestMethod.POST },
        { path: 'auth/forget-password/verify', method: RequestMethod.POST },
        { path: 'auth/new/forget-password/verify', method: RequestMethod.POST },
        { path: 'business-auth/login', method: RequestMethod.POST },
        { path: 'business-auth/staff/login', method: RequestMethod.POST },
        { path: 'business-auth/register', method: RequestMethod.POST },
        { path: 'business-auth/verify', method: RequestMethod.POST },
        { path: 'business-auth/forgot-password', method: RequestMethod.POST },
        { path: 'business-auth/reset-password', method: RequestMethod.POST },
        // { path: 'business-authentication/new/forget-password/verify', method: RequestMethod.POST },
        { path: 'auth/logout', method: RequestMethod.POST },
        { path: 'auth/verify/otp/agent', method: RequestMethod.POST },
        { path: 'auth/send/otp/agent', method: RequestMethod.POST },
        { path: 'auth/new/register-with-phone-bvn', method: RequestMethod.POST },
        { path: 'auth/dynamic-validation', method: RequestMethod.POST },
        { path: 'auth/verify-liveness', method: RequestMethod.POST },
        { path: 'file-upload/upload/single', method: RequestMethod.POST },
        { path: 'file-upload/upload/multiple', method: RequestMethod.POST },
        { path: 'auth/test-bvn/:code', method: RequestMethod.POST },
        { path: 'auth/nibss-igree-idp', method: RequestMethod.GET },
        { path: 'kyc/get-states', method: RequestMethod.GET },
        { path: 'kyc/get-lgas/*', method: RequestMethod.GET },

        // Exclude all routes that start with /admin
        //{ path: `${ADMIN_PREFIX}/(.*)`, method: RequestMethod.ALL },
        { path: `admin-dashboard/(.*)`, method: RequestMethod.ALL },

        // Exclude all routes that start with /workspace
        { path: `${WORKSPACE_PREFIX}/(.*)`, method: RequestMethod.ALL },

        // Exclude all routes that start with /app
        { path: `app/(.*)`, method: RequestMethod.ALL },

        // Exclude all routes that start with /network
        { path: `network/(.*)`, method: RequestMethod.ALL },

        // Exclude all routes that start with /webhook
        { path: `webhook/(.*)`, method: RequestMethod.ALL },

        // Exclude all routes that start with /events
        { path: `events/(.*)`, method: RequestMethod.ALL },

        // Except all routes that start with /api
        { path: `api/(.*)`, method: RequestMethod.ALL },

        { path: `queues/(.*)`, method: RequestMethod.ALL },

        // Exclude all routes that start with /EXTERNAL_PREFIX
      )
      .forRoutes('*')

      /* Admin Middleware
      .apply(AdminMiddleware)
      .exclude({ path: `${ADMIN_PREFIX}/login`, method: RequestMethod.POST })
      .forRoutes(
        // for only admin routes
        { path: `${ADMIN_PREFIX}/*`, method: RequestMethod.ALL },
      ) 

      // Workspace Middleware
      .apply(WorkspaceMiddleware)
      .forRoutes(`${WORKSPACE_PREFIX}/*`)
      */

      // External Middleware
      .apply(ExternalMiddleware);
    }
}
