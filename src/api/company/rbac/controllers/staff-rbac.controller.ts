import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Staff } from '@prisma/client';
import { AccountType } from '@common/enums';
import { AuthUserInterceptor } from '@api/common/auth/interceptors/authenticated-account.interceptor';
import { CurrentUser } from '@common/decorators/current-user';
import { ApiHeaders } from '@common/decorators/defaultHeaders';
import { Permissions, Roles } from '@common/decorators/role.decorator';
import { PermissionsGuard } from '../guards/permissions.guard';
import { StaffRbacService } from '../services/staff-rbac.service';
import {
  AssignStaffRoleDto,
  SetStaffPermissionOverridesDto,
} from '../dtos/rbac.dto';

type StaffActor = Staff & {
  companyId: string;
  companyPk: number;
  accountType?: AccountType;
};

@ApiTags('RBAC — Staff Access')
@Controller('company/rbac/staff')
@ApiHeaders()
@ApiBearerAuth('bearer')
@ApiSecurity('api-key')
@UseInterceptors(AuthUserInterceptor)
@UseGuards(PermissionsGuard)
@Roles(AccountType.STAFF)
export class StaffRbacController {
  constructor(private readonly staffRbacService: StaffRbacService) {}

  @Get(':staffId/permissions')
  @Permissions('staff:read')
  @ApiOperation({
    summary: 'Get base / grants / denies / effective permissions for a staff member',
  })
  @ApiParam({ name: 'staffId', description: 'Staff UUID' })
  getPermissions(
    @CurrentUser() user: StaffActor,
    @Param('staffId') staffId: string,
  ) {
    return this.staffRbacService.getStaffPermissions(
      this.requireCompany(user),
      staffId,
    );
  }

  @Patch(':staffId/role')
  @Permissions('staff:assign_role')
  @ApiOperation({
    summary: 'Assign system StaffRole and/or custom Role to a staff member',
  })
  @ApiParam({ name: 'staffId', description: 'Staff UUID' })
  @ApiBody({ type: AssignStaffRoleDto })
  assignRole(
    @CurrentUser() user: StaffActor,
    @Param('staffId') staffId: string,
    @Body() dto: AssignStaffRoleDto,
  ) {
    return this.staffRbacService.assignRole(
      this.requireCompany(user),
      staffId,
      dto,
    );
  }

  @Put(':staffId/permissions/overrides')
  @Permissions('staff:assign_role')
  @ApiOperation({
    summary:
      'Replace per-user GRANT/DENY overrides (does not change the shared role)',
  })
  @ApiParam({ name: 'staffId', description: 'Staff UUID' })
  @ApiBody({ type: SetStaffPermissionOverridesDto })
  setOverrides(
    @CurrentUser() user: StaffActor,
    @Param('staffId') staffId: string,
    @Body() dto: SetStaffPermissionOverridesDto,
  ) {
    return this.staffRbacService.setPermissionOverrides(
      this.requireCompany(user),
      staffId,
      dto,
    );
  }

  private requireCompany(user: StaffActor): StaffActor {
    if (!user?.companyId || user.companyPk == null) {
      throw new ForbiddenException('Staff company context required');
    }
    return user;
  }
}
