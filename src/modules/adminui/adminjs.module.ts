import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CResourceBuilder } from './resource.service';
import { DatabaseModule } from '@database/database.module';
import { AdminModule as AdminJsModule } from '@adminjs/nestjs';
import * as session from 'express-session';
import * as RedisStore from 'connect-redis';
import Redis from '@redis/index';
import AdminJS from 'adminjs';
import { Database, Resource } from '@adminjs/prisma';
import { APP_ENV } from '@common/interfaces';

AdminJS.registerAdapter({ Database, Resource });

@Module({
  imports: [
    DatabaseModule,
    AdminJsModule.createAdminAsync({
      imports: [ConfigModule, AdminUiModule],
      useFactory: (
        configService: ConfigService,
        resourceBuilder: CResourceBuilder,
      ) => {
        const NODE_ENV = configService.get<APP_ENV>('NODE_ENV');
        const SessionStore = RedisStore(session);
        const resources =  []
        // resourceBuilder
        //   .addResource('User')
        //   .addResource('Profile')
        //   .addResource('ApiKey')
        //   .addResource('Workspace')
        //   .addResource('WorkspaceAccount')
        //   .addResource('Image')
        //   .addResource('AccountTier')
        //   .addResource('BankAccount')
        //   .addResource('VirtualCard')
        //   .addResource('PhysicalCard')
        //   .addResource('GlobalTransactionLog')
        //   .addResource('Transaction')
        //   .addResource('WorkspaceTransaction')
        //   .addResource('WorkspaceUserAccount')
        //   .addResource('WorkspaceMandate')
        //   .addResource('WebhookEvent')
        //   .build();

        if (NODE_ENV === 'development') {
          return {
            adminJsOptions: {
              rootPath: '/admin-dashboard',
              branding: {
                companyName: configService.get('BANK_NAME'),
              },
              resources: resources,
            },
          };
        }
        return {
          adminJsOptions: {
            rootPath: '/admin-dashboard',
            loginPath: '/admin-dashboard/login',
            logoutPath: '/admin-dashboard/logout',
            branding: {
              companyName: configService.get('BANK_NAME'),
            },
            resources: resources,
            auth: {
              //authenticate: adminJsAuthenticate,
              cookieName: 'adminjs',
              cookiePassword: configService.get('ADMINJS_COOKIE_PASSWORD'),
            },
            sessionOptions: {
              resave: false,
              saveUninitialized: false,
              secret: configService.get('APP_SESSION_SECRET'),
              store: new SessionStore({
                client: new Redis({
                  port: configService.get('REDIS_PORT'),
                  host: configService.get('REDIS_HOST'),
                  password: configService.get('REDIS_PASSWORD'),
                }),
                logErrors: true,
              }),
            },
          },
        };
      },
      inject: [ConfigService, CResourceBuilder],
    }),
  ],
  providers: [CResourceBuilder],
  exports: [CResourceBuilder],
})
export class AdminUiModule {}
