import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, RequestMethod } from '@nestjs/common';
import { AuthenticationModule } from '@api/authentication/authentication.module';
import { UserModule } from '@api/user/user.module';
import { useContainer } from 'class-validator';
import { NetworkModule } from '@modules/network/network.module';
import * as bodyParser from 'body-parser';
import * as winston from 'winston';
import { createLogger } from 'winston';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import * as path from 'path';
import SwaggerInit from './swagger';
import { WebhookModule } from '@api/webhook/webhook.module';
import { EventModule } from '@api/events/events.module';
import { APP_ENV } from '@common/interfaces';
import { KycModule } from '@api/kyc/kyc.module';
import { BookingModule } from '@api/booking/booking.module';

async function bootstrap() {
  const logger = new Logger(bootstrap.name);

  // Create winston logger
  const instance = createLogger({
    level: 'debug',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
      nestWinstonModuleUtilities.format.nestLike('AppMonitor', {
        prettyPrint: true,
      }),
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
          nestWinstonModuleUtilities.format.nestLike('AppMonitor', {
            colors: true,
            prettyPrint: true,
          }),
        ),
      }),
      new winston.transports.File({
        filename: path.join(__dirname, '..', 'logs', 'error.log'),
        level: 'error',
      }),
      new winston.transports.File({
        filename: path.join(__dirname, '..', 'logs', 'debug.log'),
      }),
    ],
  });

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
    logger: WinstonModule.createLogger({
      instance,
    }),
  });

  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api/v1', {
    exclude: [{ path: `/queues`, method: RequestMethod.ALL }],
  })

  // Solution for entity to large:
  // https://stackoverflow.com/questions/52783959/nest-js-request-entity-too-large-payloadtoolargeerror-request-entity-too-larg
  const MAX_BODY_SIZE = '4mb';
  app.use(bodyParser.json({ limit: MAX_BODY_SIZE }));
  app.use(bodyParser.urlencoded({ limit: MAX_BODY_SIZE, extended: true }));
  app.useBodyParser('text');

  // Pass app to class-validator service container
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const modules = [
    AppModule,
    AuthenticationModule,
    UserModule,
    WebhookModule,
    EventModule,
    KycModule,
    BookingModule,
  ];

  const isDev = configService.get<APP_ENV>('NODE_ENV') === 'development';

  if (isDev) {
    modules.push(NetworkModule);
  }

  // Configure swagger
  SwaggerInit(app, modules);

  await app.listen(configService.get('PORT') ?? 8080);

  const appUrl = await app.getUrl();

  logger.log(`Listening on ${appUrl}`);
}
bootstrap();
