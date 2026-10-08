import { Module } from '@nestjs/common';
import { PlatformAuthModule } from './auth/platform-auth.module';
import { PlatformAdminModule } from './admin/platform-admin.module';

@Module({
  imports: [PlatformAuthModule, PlatformAdminModule],
})
export class PlatformModule {}
