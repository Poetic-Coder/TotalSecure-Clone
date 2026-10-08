import { Module } from '@nestjs/common';
import { CommonAuthModule } from '@api/common/auth/common-auth.module';
import { PlatformAdminController } from './platform-admin.controller';
import { SecurityModule } from '@modules/security/security.module';

@Module({
  imports: [CommonAuthModule, SecurityModule],
  controllers: [PlatformAdminController],
})
export class PlatformAdminModule {}
