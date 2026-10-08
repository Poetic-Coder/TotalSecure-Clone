import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from '@database/database.module';
import { HashingModule } from '@modules/hashing/hashing.module';
import { SecurityModule } from '@modules/security/security.module';
import { CompanyRbacModule } from '@api/company/rbac/company-rbac.module';
import { AuthAccountService } from './services/auth-account.service';
import { AuthSessionService } from './services/auth-session.service';
import { AuthUserInterceptor } from './interceptors/authenticated-account.interceptor';
import { ImpersonationAuditInterceptor } from './interceptors/impersonation-audit.interceptor';
import { AuthRateLimitGuard } from './guards/auth-rate-limit.guard';
import { RolesGuard } from './guards/role.guard';

@Module({
  imports: [
    ConfigModule,
    HashingModule,
    DatabaseModule,
    SecurityModule,
    forwardRef(() => CompanyRbacModule),
  ],
  providers: [
    AuthSessionService,
    AuthAccountService,
    AuthUserInterceptor,
    AuthRateLimitGuard,
    ImpersonationAuditInterceptor,
    RolesGuard,
    {
      provide: APP_GUARD,
      useExisting: RolesGuard,
    },
  ],
  exports: [
    AuthSessionService,
    AuthAccountService,
    AuthUserInterceptor,
    AuthRateLimitGuard,
    ImpersonationAuditInterceptor,
    RolesGuard,
  ],
})
export class CommonAuthModule {}
