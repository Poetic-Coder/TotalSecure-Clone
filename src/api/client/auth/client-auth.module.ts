import { Module } from '@nestjs/common';
import { CommonAuthModule } from '@api/common/auth/common-auth.module';
import { ClientAuthController } from './client-auth.controller';
import { SecurityModule } from '@modules/security/security.module';

@Module({
  imports: [CommonAuthModule, SecurityModule],
  controllers: [ClientAuthController],
})
export class ClientAuthModule {}
