import { forwardRef, Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { AuthSessionController } from './controllers/auth-session.controller';
import { PlatformAdminController } from './controllers/platform-admin.controller';
import { CompanyAdminController } from './controllers/company-admin.controller';
import { AuthSessionService } from './services/auth-session.service';
import { AuthAccountService } from './services/auth-account.service';
import { HashingModule } from '@modules/hashing/hashing.module';
import { UserModule } from '@api/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './guards/role.guard';
import { DatabaseModule } from '@database/database.module';
import { SecurityModule } from '@modules/security/security.module';
import { KycModule } from '@api/kyc/kyc.module';
import { VirtualSwitchAIService } from '@modules/clients/clients/ai/virtualSwitchAi';
import { RbacModule } from '@api/rbac/rbac.module';
import { AuthUserInterceptor } from '@common/interceptors/authenticated-account.interceptor';
import { AuthRateLimitGuard } from './guards/auth-rate-limit.guard';
import { ImpersonationAuditInterceptor } from './interceptors/impersonation-audit.interceptor';

@Module({
  imports: [
    ConfigModule,
    HashingModule,
    forwardRef(() => UserModule),
    DatabaseModule,
    SecurityModule,
    KycModule,
    forwardRef(() => RbacModule),
  ],
  controllers: [
    AuthSessionController,
    PlatformAdminController,
    CompanyAdminController,
    AuthenticationController,
  ],
  providers: [
    AuthenticationService,
    AuthSessionService,
    AuthAccountService,
    AuthUserInterceptor,
    AuthRateLimitGuard,
    ImpersonationAuditInterceptor,
    VirtualSwitchAIService,
    {
      provide: APP_GUARD,
      useExisting: RolesGuard,
    },
    RolesGuard,
  ],
  exports: [
    AuthenticationService,
    AuthSessionService,
    AuthAccountService,
    AuthUserInterceptor,
    AuthRateLimitGuard,
    VirtualSwitchAIService,
  ],
})
export class AuthenticationModule {}
