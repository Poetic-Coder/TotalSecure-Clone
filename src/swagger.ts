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

  const appName = `${configService.get('APP_NAME')} API`;

  const config = new DocumentBuilder()
    .setTitle(appName)
    .setDescription(
      [
        `API documentation for ${appName}.`,
        '',
        '## Base',
        '- Global prefix: `/api/v1`',
        '- Public auth routes do **not** require `x-api-key`.',
        '- Protected routes require `Authorization: Bearer <accessToken>` and usually `x-api-key`.',
        '- Access token TTL: ~30 minutes. Refresh via each portal `.../auth/refresh`.',
        '',
        '## Portal logins',
        '| Portal | Login | Who |',
        '|---|---|---|',
        '| Platform | `POST /platform/auth/login` | PlatformStaff |',
        '| Company | `POST /company/auth/login` | Company account **or** Staff |',
        '| Guard | `POST /company/auth/guard/login` | Guard |',
        '| Client | `POST /client/auth/login` | Client |',
        '| Client staff | `POST /client/portal/login` | ClientStaff |',
        '',
        '## Register',
        '- `POST /company/auth/register` — company self-signup (`PENDING_APPROVAL`, unique `domain`)',
        '- `POST /client/auth/register` — client self-signup via company white-label `domain` (`PENDING_APPROVAL`)',
        '- `GET /company/auth/branding?domain=` — public branding for login/register screens',
        '',
        '## Admin',
        '- Platform: `POST /platform/admin/staff`, `/platform/admin/companies/:id/approve|reject|impersonate`, assignments',
        '- Company: `POST /company/admin/staff`, `/company/admin/clients`, approve/reject/disable',
        '',
        '## Company staff & RBAC',
        '- Self-service: `/company/staff/*` (profile, password, photo)',
        '- Roles: `/company/rbac/*` · Staff access: `/company/rbac/staff/*`',
        '',
        '## Session (per portal)',
        '- `POST .../auth/refresh` · `POST .../auth/logout` · `GET .../auth/me`',
        '- MFA: `.../auth/mfa/verify|enable|disable`',
        '- Password: `.../auth/forgot-password` · `.../auth/reset-password`',
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
    .addTag('Platform Auth', 'Platform staff login, session, MFA, password')
    .addTag(
      'Platform Admin',
      'Create platform staff, company approve/reject, assignments, impersonation',
    )
    .addTag(
      'Company Auth',
      'Company/staff login, guard login, register, branding, session, MFA',
    )
    .addTag(
      'Company Admin',
      'Create/disable staff, onboard/approve/reject clients',
    )
    .addTag('Company Staff', 'Logged-in staff profile, password, photo')
    .addTag('RBAC — Roles & Permissions', 'Company roles and permission catalogue')
    .addTag('RBAC — Staff Access', 'Assign roles and permission overrides')
    .addTag('Client Auth', 'Client login, register, session, MFA, password')
    .addTag('Client Portal', 'ClientStaff login')
    .addTag('File Upload', 'Base64 file upload to Cloudinary')
    .addTag('support', 'Helpdesk tickets and support portal')
    .build();

  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
      filter: true,
    },
    customSiteTitle: appName,
    useGlobalPrefix: false,
  };

  const NODE_ENV = configService.get<APP_ENV>('NODE_ENV');

  const swaggerRoute = configService.get<string>('SWAGGER_ROUTE');

  const document = SwaggerModule.createDocument(app, config, {
    include: modules,
    operationIdFactory: (controllerKey, methodKey) =>
      `${controllerKey}_${methodKey}`,
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
