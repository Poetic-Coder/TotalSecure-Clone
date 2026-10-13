import { Module } from '@nestjs/common';
import { ClientAuthModule } from './auth/client-auth.module';
import { ClientPortalModule } from './portal/client-portal.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [ClientAuthModule, ClientPortalModule, DashboardModule],
})
export class ClientModule {}
