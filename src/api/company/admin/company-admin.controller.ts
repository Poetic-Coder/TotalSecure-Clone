import {
  Body,
  Controller,
  Param,
  Patch,
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
import { ImpersonationAuditInterceptor } from '@api/common/auth/interceptors/impersonation-audit.interceptor';
import { RolesGuard } from '@api/common/auth/guards/role.guard';
import { AuthAccountService } from '@api/common/auth/services/auth-account.service';
import {
  CreateCompanyClientDto,
  CreateCompanyStaffDto,
  MessageResponseDto,
  RejectAccountDto,
} from '@api/common/auth/dtos/unified-auth.dto';
import { AccountType } from '@common/enums';
import { CurrentUser } from '@common/decorators/current-user';
import { ApiHeaders } from '@common/decorators/defaultHeaders';
import { Roles } from '@common/decorators/role.decorator';
import { AuthenticatedRequestUser } from '@common/interfaces';

@ApiTags('Company Admin')
@Controller('company/admin')
@ApiHeaders()
@ApiBearerAuth('bearer')
@ApiSecurity('api-key')
@UseInterceptors(AuthUserInterceptor, ImpersonationAuditInterceptor)
@UseGuards(RolesGuard)
@Roles(AccountType.COMPANY)
@ApiForbiddenResponse({
  description: 'Not a company account, or action blocked while impersonating',
})
export class CompanyAdminController {
  constructor(private readonly accounts: AuthAccountService) {}

  @Post('staff')
  @ApiOperation({
    summary: 'Create internal staff',
    description: 'Company login only. Blocked during platform impersonation.',
  })
  @ApiBody({ type: CreateCompanyStaffDto })
  @ApiOkResponse({ description: 'Created staff (password stripped)' })
  createStaff(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: CreateCompanyStaffDto,
  ) {
    return this.accounts.createCompanyStaff(user, dto);
  }

  @Patch('staff/:id/disable')
  @ApiOperation({
    summary: 'Disable staff',
    description: 'Sets INACTIVE and revokes sessions. Blocked while impersonating.',
  })
  @ApiParam({ name: 'id', description: 'Staff UUID' })
  @ApiOkResponse({ type: MessageResponseDto })
  disableStaff(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
  ) {
    return this.accounts.disableStaff(user, id);
  }

  @Patch('staff/:id/enable')
  @ApiOperation({ summary: 'Re-enable staff' })
  @ApiParam({ name: 'id', description: 'Staff UUID' })
  @ApiOkResponse({ type: MessageResponseDto })
  enableStaff(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
  ) {
    return this.accounts.enableStaff(user, id);
  }

  @Post('clients')
  @ApiOperation({
    summary: 'Onboard a client (auto-approved)',
    description:
      'Creates ACTIVE client with onboardingMethod STAFF_ONBOARDED. Blocked while impersonating.',
  })
  @ApiBody({ type: CreateCompanyClientDto })
  @ApiOkResponse({ description: 'Created client (password stripped)' })
  createClient(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: CreateCompanyClientDto,
  ) {
    return this.accounts.createCompanyClient(user, dto);
  }

  @Post('clients/:id/approve')
  @ApiOperation({
    summary: 'Approve self-signup client',
    description: 'PENDING_APPROVAL → ACTIVE. Blocked while impersonating.',
  })
  @ApiParam({ name: 'id', description: 'Client UUID' })
  @ApiOkResponse({ description: 'Approved client' })
  approveClient(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
  ) {
    return this.accounts.approveClient(user, id);
  }

  @Post('clients/:id/reject')
  @ApiOperation({ summary: 'Reject self-signup client' })
  @ApiParam({ name: 'id', description: 'Client UUID' })
  @ApiBody({ type: RejectAccountDto })
  @ApiOkResponse({ description: 'Rejected client' })
  rejectClient(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
    @Body() dto: RejectAccountDto,
  ) {
    return this.accounts.rejectClient(user, id, dto.reason);
  }
}
