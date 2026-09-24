import { Module } from '@nestjs/common';
import { CommonAuthModule } from '@api/common/auth/common-auth.module';
import { PlatformAdminController } from './platform-admin.controller';

@Module({
  imports: [CommonAuthModule],
  controllers: [PlatformAdminController],
})
export class PlatformAdminModule {}
