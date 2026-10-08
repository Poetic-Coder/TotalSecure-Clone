import { Module } from '@nestjs/common';
import { CommonAuthModule } from '@api/common/auth/common-auth.module';
import { ClientAuthController } from './client-auth.controller';

@Module({
  imports: [CommonAuthModule],
  controllers: [ClientAuthController],
})
export class ClientAuthModule {}
