import { Module } from '@nestjs/common';
import { CommonAuthModule } from '@api/common/auth/common-auth.module';
import { CompanyAuthController } from './company-auth.controller';
import { SecurityModule } from '@modules/security/security.module';

@Module({
  imports: [CommonAuthModule, SecurityModule],
  controllers: [CompanyAuthController],
})
export class CompanyAuthModule {}
