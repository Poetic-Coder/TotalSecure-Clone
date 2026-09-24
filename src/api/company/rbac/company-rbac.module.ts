import { forwardRef, Module } from '@nestjs/common';
import { DatabaseModule } from '@database/database.module';
import { SecurityModule } from '@modules/security/security.module';
import { CommonAuthModule } from '@api/common/auth/common-auth.module';
import { PermissionResolverService } from './services/permission-resolver.service';
import { PermissionsGuard } from './guards/permissions.guard';
import { AuditLogService } from './services/audit-log.service';
import { CompanyPlanService } from './services/company-plan.service';
import { RolesService } from './services/roles.service';
import { StaffRbacService } from './services/staff-rbac.service';
import { RolesController } from './controllers/roles.controller';
import { StaffRbacController } from './controllers/staff-rbac.controller';

@Module({
  imports: [
    DatabaseModule,
    SecurityModule,
    forwardRef(() => CommonAuthModule),
  ],
  controllers: [RolesController, StaffRbacController],
  providers: [
    PermissionResolverService,
    PermissionsGuard,
    AuditLogService,
    CompanyPlanService,
    RolesService,
    StaffRbacService,
  ],
  exports: [PermissionResolverService, AuditLogService],
})
export class CompanyRbacModule {}
