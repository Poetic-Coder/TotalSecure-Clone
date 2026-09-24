import { Module } from '@nestjs/common';
import { CompanyAuthModule } from './auth/company-auth.module';
import { CompanyAdminModule } from './admin/company-admin.module';
import { CompanyStaffModule } from './staff/company-staff.module';
import { CompanyRbacModule } from './rbac/company-rbac.module';

@Module({
  imports: [
    CompanyAuthModule,
    CompanyAdminModule,
    CompanyStaffModule,
    CompanyRbacModule,
  ],
})
export class CompanyModule {}
