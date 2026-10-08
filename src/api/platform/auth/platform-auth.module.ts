import { Module } from '@nestjs/common';
import { CommonAuthModule } from '@api/common/auth/common-auth.module';
import { PlatformAuthController } from './platform-auth.controller';

@Module({
  imports: [CommonAuthModule],
  controllers: [PlatformAuthController],
})
export class PlatformAuthModule {}
