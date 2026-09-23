import { Module, forwardRef } from '@nestjs/common';
import { BusinessAuthService } from './business-auth.service';
import { BusinessAuthController } from './business-auth.controller';
import { BusinessAuthGuard } from './guards/business-auth.guard';
import { ClientRolesGuard } from './guards/client-roles.guard';
import { HashingModule } from '@modules/hashing/hashing.module';
import { DatabaseModule } from '@database/database.module';
import { SecurityModule } from '@modules/security/security.module';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationModule } from '@api/authentication/authentication.module';

@Module({
  imports: [
    ConfigModule,
    HashingModule,
    DatabaseModule,
    SecurityModule,
    forwardRef(() => AuthenticationModule),
  ],
  controllers: [BusinessAuthController],
  providers: [
    BusinessAuthService,
    BusinessAuthGuard,
    ClientRolesGuard,
  ],
  exports: [
    BusinessAuthService,
    BusinessAuthGuard,
    ClientRolesGuard,
  ],
})
export class BusinessAuthModule {}
