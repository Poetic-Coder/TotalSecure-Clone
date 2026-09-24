import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
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
import { RolesService } from '../services/roles.service';
import {
  CreateRoleDto,
  SetRolePermissionsDto,
  UpdateRoleDto,
} from '../dtos/rbac.dto';

type StaffActor = Staff & {
  companyId: string;
  companyPk: number;
  permissions?: string[];
  accountType?: AccountType;
};

@ApiTags('RBAC — Roles & Permissions')
@Controller('company/rbac')
@ApiHeaders()
@ApiBearerAuth('bearer')
@ApiSecurity('api-key')
@UseInterceptors(AuthUserInterceptor)
@UseGuards(PermissionsGuard)
@Roles(AccountType.STAFF)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get('permissions')
  @Permissions('role:read')
  @ApiOperation({ summary: 'List global permission catalogue' })
  listPermissions() {
    return this.rolesService.listPermissions();
  }

  @Get('roles')
  @Permissions('role:read')
  @ApiOperation({ summary: 'List system + company custom roles' })
  listRoles(@CurrentUser() user: StaffActor) {
    return this.rolesService.listRoles(this.requireCompany(user).companyId);
  }

  @Get('roles/:id')
  @Permissions('role:read')
  @ApiOperation({ summary: 'Get a role and its permissions' })
  @ApiParam({ name: 'id', description: 'Role UUID' })
  getRole(@CurrentUser() user: StaffActor, @Param('id') id: string) {
    return this.rolesService.getRole(id, this.requireCompany(user).companyId);
  }

  @Post('roles')
  @Permissions('role:create')
  @ApiOperation({
    summary: 'Create a company custom role',
    description: 'Requires plan hasCustomRoles',
  })
  @ApiBody({ type: CreateRoleDto })
  createRole(@CurrentUser() user: StaffActor, @Body() dto: CreateRoleDto) {
    return this.rolesService.createCustomRole(this.requireCompany(user), dto);
  }

  @Patch('roles/:id')
  @Permissions('role:update')
  @ApiOperation({ summary: 'Update a company custom role' })
  @ApiParam({ name: 'id', description: 'Role UUID' })
  @ApiBody({ type: UpdateRoleDto })
  updateRole(
    @CurrentUser() user: StaffActor,
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.rolesService.updateCustomRole(
      this.requireCompany(user),
      id,
      dto,
    );
  }

  @Delete('roles/:id')
  @Permissions('role:delete')
  @ApiOperation({ summary: 'Delete a company custom role' })
  @ApiParam({ name: 'id', description: 'Role UUID' })
  deleteRole(@CurrentUser() user: StaffActor, @Param('id') id: string) {
    return this.rolesService.deleteCustomRole(this.requireCompany(user), id);
  }

  @Put('roles/:id/permissions')
  @Permissions('role:manage')
  @ApiOperation({ summary: 'Replace permissions on a company custom role' })
  @ApiParam({ name: 'id', description: 'Role UUID' })
  @ApiBody({ type: SetRolePermissionsDto })
  @ApiOkResponse({ description: 'Updated role with permission list' })
  setRolePermissions(
    @CurrentUser() user: StaffActor,
    @Param('id') id: string,
    @Body() dto: SetRolePermissionsDto,
  ) {
    return this.rolesService.setRolePermissions(
      this.requireCompany(user),
      id,
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
