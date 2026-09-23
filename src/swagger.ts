import { APP_ENV } from '@common/interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';

export default function SwaggerInit(
  app: INestApplication,
  // eslint-disable-next-line @typescript-eslint/ban-types
  modules?: Function[],
) {

  const configService = app.get(ConfigService);

  const appName = `${configService.get("APP_NAME")} API`;

  const config = new DocumentBuilder()
    .setTitle(appName)
    .setDescription(
      [
        `API documentation for ${appName}.`,
        '',
        '## Authentication (v2)',
        '- Base path: `/api/v1`',
        '- Public auth routes do **not** require `x-api-key`.',
        '- Protected routes require `Authorization: Bearer <accessToken>` and usually `x-api-key`.',
        '- Access token TTL: ~30 minutes. Use `/auth/refresh` with `refreshToken`.',
        '- Shared login: `POST /auth/login` with `{ email, password }` — account type is auto-detected.',
        '- Platform login is separate: `POST /auth/platform/login`.',
        '- Client self-signup uses white-label `domain` (not `companyId`).',
        '- New companies/clients start as `PENDING_APPROVAL` until approved.',
        '',
        '## Deprecated',
        '- Prefer `/auth/*` over `/business-auth/*`.',
        '- `POST /business-auth/verify` returns 410 Gone.',
      ].join('\n'),
    )
    .setVersion('2.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access token from login / refresh / impersonate',
      },
      'bearer',
    )
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description: 'Required on most protected routes (not public auth)',
      },
      'api-key',
    )
    .addTag('Authentication', 'Unified login, register, session, MFA, password')
    .addTag('Platform', 'Platform staff admin, company approval, impersonation')
    .addTag('Company', 'Company admin: staff, clients, approvals')
    .addTag(
      'Business Authentication',
      'Deprecated legacy client routes — prefer Authentication',
    )
    .build();

  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: appName,
    useGlobalPrefix: false,
  };

  const NODE_ENV = configService.get<APP_ENV>('NODE_ENV');

  const swaggerRoute = configService.get<string>('SWAGGER_ROUTE');

  const document = SwaggerModule.createDocument(app, config, {
    include: modules,
    operationIdFactory: (_controllerKey, methodKey) => methodKey,
  });

  if (NODE_ENV != 'development') {
    const DEFAULT_ADMIN_USERNAME = configService.get<string>(
      'DEFAULT_ADMIN_USERNAME',
    );

    const DEFAULT_ADMIN_PASSWORD = configService.get<string>(
      'DEFAULT_ADMIN_PASSWORD',
    );

    app.use(
      swaggerRoute,
      basicAuth({
        challenge: true,
        users: { [DEFAULT_ADMIN_USERNAME]: DEFAULT_ADMIN_PASSWORD },
      }),
    );
  }

  SwaggerModule.setup(swaggerRoute, app, document, customOptions);
}
