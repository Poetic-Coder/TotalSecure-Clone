import { Module } from '@nestjs/common';
import { CommonAuthModule } from '@api/common/auth/common-auth.module';
import { PlatformAuthController } from './platform-auth.controller';
import { SecurityModule } from '@modules/security/security.module';

@Module({
  imports: [CommonAuthModule, SecurityModule],
  controllers: [PlatformAuthController],
})
export class PlatformAuthModule {}
