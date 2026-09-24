import { Module } from '@nestjs/common';
import { ClientAuthModule } from './auth/client-auth.module';
import { ClientPortalModule } from './portal/client-portal.module';

@Module({
  imports: [ClientAuthModule, ClientPortalModule],
})
export class ClientModule {}
