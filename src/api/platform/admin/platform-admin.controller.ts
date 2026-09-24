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
import { AuthUserInterceptor } from '@api/common/auth/interceptors/authenticated-account.interceptor';
import { RolesGuard } from '@api/common/auth/guards/role.guard';
import { AuthAccountService } from '@api/common/auth/services/auth-account.service';
import {
  AssignCompanyDto,
  AuthSessionResponseDto,
  CreatePlatformStaffDto,
  MessageResponseDto,
  RejectAccountDto,
} from '@api/common/auth/dtos/unified-auth.dto';
import { AccountType } from '@common/enums';
import { CurrentUser } from '@common/decorators/current-user';
import { ApiHeaders } from '@common/decorators/defaultHeaders';
import { Roles } from '@common/decorators/role.decorator';
import { AuthenticatedRequestUser } from '@common/interfaces';

@ApiTags('Platform Admin')
@Controller('platform/admin')
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
  @ApiOkResponse({ description: 'Created platform staff (password stripped)' })
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
  @ApiOkResponse({ description: 'Assignment created' })
  assign(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: AssignCompanyDto,
  ) {
    return this.accounts.assignCompany(user, dto);
  }

  @Delete('assignments/:id')
  @ApiOperation({ summary: 'Remove a company assignment' })
  @ApiParam({ name: 'id', description: 'Assignment UUID' })
  @ApiOkResponse({ type: MessageResponseDto })
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
  @ApiOkResponse({ description: 'Approved company' })
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
  @ApiOkResponse({ description: 'Rejected company' })
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
      'Issues a company session. Token userAccount.impersonatedBy is set. Company must be assigned to this platform staff.',
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
