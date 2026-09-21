import { Module } from '@nestjs/common';
import { DatabaseModule } from '@database/database.module';
import { SecurityModule } from '@modules/security/security.module';
import { PermissionResolverService } from './services/permission-resolver.service';
import { PermissionsGuard } from './guards/permissions.guard';
import { AuditLogService } from './services/audit-log.service';
import { CompanyPlanService } from './services/company-plan.service';
import { RolesService } from './services/roles.service';
import { StaffRbacService } from './services/staff-rbac.service';
import { RolesController } from './controllers/roles.controller';
import { StaffRbacController } from './controllers/staff-rbac.controller';
import { AuthUserInterceptor } from '@common/interceptors/authenticated-account.interceptor';

@Module({
  imports: [DatabaseModule, SecurityModule],
  controllers: [RolesController, StaffRbacController],
  providers: [
    PermissionResolverService,
    PermissionsGuard,
    AuditLogService,
    CompanyPlanService,
    RolesService,
    StaffRbacService,
    AuthUserInterceptor,
  ],
  exports: [
    PermissionResolverService,
    PermissionsGuard,
    AuditLogService,
    CompanyPlanService,
    RolesService,
    StaffRbacService,
  ],
})
export class RbacModule {}
