import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AccountType } from '@common/enums';
import { AuthUserInterceptor } from '@common/interceptors/authenticated-account.interceptor';
import { CurrentUser } from '@common/decorators/current-user';
import { ApiHeaders } from '@common/decorators/defaultHeaders';
import { Roles } from '@common/decorators/role.decorator';
import { AuthenticatedRequestUser } from '@common/interfaces';
import { RolesGuard } from '../guards/role.guard';
import { AuthAccountService } from '../services/auth-account.service';
import {
  AssignCompanyDto,
  AuthSessionResponseDto,
  CreatePlatformStaffDto,
  RejectAccountDto,
} from '../dtos/unified-auth.dto';

@ApiTags('Platform')
@Controller('platform')
@ApiHeaders()
@ApiBearerAuth('bearer')
@ApiSecurity('api-key')
@UseInterceptors(AuthUserInterceptor)
@UseGuards(RolesGuard)
@Roles(AccountType.PLATFORM_STAFF)
@ApiForbiddenResponse({ description: 'Not platform staff / not super admin' })
export class PlatformAdminController {
  constructor(private readonly accounts: AuthAccountService) {}

  @Post('staff')
  @ApiOperation({
    summary: 'Create platform staff',
    description: 'PLATFORM_SUPER_ADMIN only.',
  })
  @ApiBody({ type: CreatePlatformStaffDto })
  createStaff(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: CreatePlatformStaffDto,
  ) {
    return this.accounts.createPlatformStaff(user, dto);
  }

  @Post('assignments')
  @ApiOperation({
    summary: 'Assign a company to platform staff',
    description:
      'PLATFORM_SUPER_ADMIN only. Required before that staff can impersonate the company.',
  })
  @ApiBody({ type: AssignCompanyDto })
  assign(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: AssignCompanyDto,
  ) {
    return this.accounts.assignCompany(user, dto);
  }

  @Delete('assignments/:id')
  @ApiOperation({ summary: 'Remove a company assignment' })
  @ApiParam({ name: 'id', description: 'Assignment UUID' })
  unassign(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
  ) {
    return this.accounts.unassignCompany(user, id);
  }

  @Post('companies/:id/approve')
  @ApiOperation({
    summary: 'Approve pending company registration',
    description: 'PLATFORM_SUPER_ADMIN only. Sets status ACTIVE.',
  })
  @ApiParam({ name: 'id', description: 'Company UUID' })
  approveCompany(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
  ) {
    return this.accounts.approveCompany(user, id);
  }

  @Post('companies/:id/reject')
  @ApiOperation({
    summary: 'Reject pending company registration',
    description: 'PLATFORM_SUPER_ADMIN only.',
  })
  @ApiParam({ name: 'id', description: 'Company UUID' })
  @ApiBody({ type: RejectAccountDto })
  rejectCompany(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
    @Body() dto: RejectAccountDto,
  ) {
    return this.accounts.rejectCompany(user, id, dto.reason);
  }

  @Post('companies/:id/impersonate')
  @ApiOperation({
    summary: 'Impersonate an assigned company',
    description:
      'Issues a company session. Token userAccount.impersonatedBy is set. Company must be assigned to this platform staff. Cannot create staff/clients or change MFA while impersonating.',
  })
  @ApiParam({ name: 'id', description: 'Company UUID' })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  impersonate(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
  ) {
    return this.accounts.impersonateCompany(user, id);
  }
}
