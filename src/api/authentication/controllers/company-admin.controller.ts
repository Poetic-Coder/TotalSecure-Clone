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
import { ImpersonationAuditInterceptor } from '../interceptors/impersonation-audit.interceptor';
import {
  CreateCompanyClientDto,
  CreateCompanyStaffDto,
  RejectAccountDto,
} from '../dtos/unified-auth.dto';

@ApiTags('Company')
@Controller('companies')
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
  disableStaff(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
  ) {
    return this.accounts.disableStaff(user, id);
  }

  @Patch('staff/:id/enable')
  @ApiOperation({ summary: 'Re-enable staff' })
  @ApiParam({ name: 'id', description: 'Staff UUID' })
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
  rejectClient(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
    @Body() dto: RejectAccountDto,
  ) {
    return this.accounts.rejectClient(user, id, dto.reason);
  }
}
