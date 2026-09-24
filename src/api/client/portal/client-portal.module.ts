import { Module } from '@nestjs/common';
import { CommonAuthModule } from '@api/common/auth/common-auth.module';
import { ClientPortalController } from './client-portal.controller';

@Module({
  imports: [CommonAuthModule],
  controllers: [ClientPortalController],
})
export class ClientPortalModule {}
