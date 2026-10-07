import { RolesGuard } from '@api/common/auth/guards/role.guard';
import { AuthUserInterceptor } from '@api/common/auth/interceptors/authenticated-account.interceptor';
import { ApiHeaders } from '@common/decorators/defaultHeaders';
import { Roles } from '@common/decorators/role.decorator';
import { AccountType } from '@common/enums';
import {
  Controller,
  Get,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Platform Dashboard')
@Controller('platform/dashboard')
@ApiHeaders()
@ApiBearerAuth('bearer')
@ApiSecurity('api-key')
@UseInterceptors(AuthUserInterceptor)
@UseGuards(RolesGuard)
@Roles(AccountType.PLATFORM_STAFF)
@ApiForbiddenResponse({ description: 'Not platform staff / not super admin' })
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @ApiOperation({
    summary: 'Global Platform Summary',
  })
  @ApiOkResponse({
    description: 'Breakdown of company counts across all statuses',
    schema: {
      example: {
        companies: {
          total: 12,
          pending: 2,
          active: 7,
          rejected: 1,
          inactive: 1,
          suspended: 1,
          churned: 0,
        },
      },
    },
  })
  @Get('summary')
  async companySummary() {
    return this.service.companySummary();
  }

  @ApiOperation({
    summary: 'Global User Counts (Guards, Staff, Clients)',
  })
  @ApiOkResponse({
    description: 'Total counts of platform users categorized by role',
    schema: {
      example: {
        staffs: 25,
        guards: 80,
        clientStaffs: 40,
      },
    },
  })
  @Get('users')
  async totalUser() {
    return this.service.totalUsers();
  }

  @ApiOperation({
    summary: 'Global Site count',
  })
  @ApiOkResponse({
    description: 'Total count of client sites across the platform',
    schema: {
      example: {
        totalSites: 15,
      },
    },
  })
  @Get('sites')
  async sites() {
    return this.service.sites();
  }

  @ApiOperation({
    summary: 'Company Directory with usage and plan details',
  })
  @ApiOkResponse({
    description: 'List of companies with subscription plans, total users, guards, and site counts',
    schema: {
      example: [
        {
          id: 'cm1a2b3c4d5e6f7g8h9',
          name: 'Apex Security Solutions',
          status: 'ACTIVE',
          plan: 'ENTERPRISE',
          planName: 'Enterprise Tier',
          users: 45,
          guard: 30,
          site: 6,
        },
        {
          id: 'cm2b3c4d5e6f7g8h9i0',
          name: 'Shield Guard Ltd',
          status: 'PENDING_APPROVAL',
          plan: 'NONE',
          planName: 'No Plan',
          users: 0,
          guard: 0,
          site: 0,
        },
      ],
    },
  })
  @Get('company')
  async company() {
    return this.service.company();
  }

  @ApiOperation({
    summary: 'Subscriptions Expiring in the Next 30 Days',
  })
  @ApiOkResponse({
    description: 'List of company subscriptions nearing expiration within 30 days',
    schema: {
      example: [
        {
          company: {
            id: 'cm1a2b3c4d5e6f7g8h9',
            name: 'Apex Security Solutions',
            email: 'admin@apexsecurity.com',
            phone: '+2348012345678',
            logo: 'https://res.cloudinary.com/example/logo.png',
            status: 'ACTIVE',
          },
          plan: {
            name: 'Pro Tier',
            tier: 'PRO',
          },
          expirationDate: '2026-10-15T00:00:00.000Z',
          expirationDay: 18,
        },
      ],
    },
  })
  @Get('plan-expiry')
  async planExpiry() {
    return this.service.planExpiry();
  }
}
