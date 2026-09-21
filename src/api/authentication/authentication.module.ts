import { forwardRef, Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
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


@Module({
  imports: [
    ConfigModule,
    HashingModule,
    forwardRef(() => UserModule),
    DatabaseModule,
    SecurityModule,
    KycModule,
    RbacModule,
  ],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    VirtualSwitchAIService,
    {
      provide: APP_GUARD,
      useExisting: RolesGuard,
    },
    RolesGuard,
  ],
  exports: [
    AuthenticationService,
    VirtualSwitchAIService
  ]
})
export class AuthenticationModule { }
