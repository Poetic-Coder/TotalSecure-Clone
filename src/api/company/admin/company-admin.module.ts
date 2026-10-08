import { Module } from '@nestjs/common';
import { CommonAuthModule } from '@api/common/auth/common-auth.module';
import { CompanyAdminController } from './company-admin.controller';

@Module({
  imports: [CommonAuthModule],
  controllers: [CompanyAdminController],
})
export class CompanyAdminModule {}
