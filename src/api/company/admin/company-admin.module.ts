import { Module } from '@nestjs/common';
import { CommonAuthModule } from '@api/common/auth/common-auth.module';
import { CompanyAdminController } from './company-admin.controller';
import { SecurityModule } from '@modules/security/security.module';
import { CompanyRbacModule } from '../rbac/company-rbac.module';

@Module({
  imports: [CommonAuthModule, SecurityModule, CompanyRbacModule],
  controllers: [CompanyAdminController],
})
export class CompanyAdminModule {}
