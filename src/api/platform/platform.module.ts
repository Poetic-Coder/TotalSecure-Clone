import { Module } from '@nestjs/common';
import { PlatformAuthModule } from './auth/platform-auth.module';
import { PlatformAdminModule } from './admin/platform-admin.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [PlatformAuthModule, PlatformAdminModule, DashboardModule],
})
export class PlatformModule {}
