import { Module } from '@nestjs/common';
import { CommonAuthModule } from '@api/common/auth/common-auth.module';
import { CompanyAdminController } from './company-admin.controller';
import { CompanyRbacModule } from '../rbac/company-rbac.module';

@Module({
  imports: [CommonAuthModule, CompanyRbacModule],
  controllers: [CompanyAdminController],
})
export class CompanyAdminModule {}
