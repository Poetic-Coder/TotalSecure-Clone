import { RolesGuard } from '@api/common/auth/guards/role.guard';
import { AuthUserInterceptor } from '@api/common/auth/interceptors/authenticated-account.interceptor';
import { CurrentUser } from '@common/decorators/current-user';
import { ApiHeaders } from '@common/decorators/defaultHeaders';
import { Roles } from '@common/decorators/role.decorator';
import { AccountType } from '@common/enums';
import { AuthenticatedRequestUser } from '@common/interfaces';
import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Company Dashboard')
@Controller('company/dashboard')
@ApiHeaders()
@ApiBearerAuth('bearer')
@ApiSecurity('api-key')
@UseInterceptors(AuthUserInterceptor)
@UseGuards(RolesGuard)
@Roles(AccountType.COMPANY, AccountType.STAFF)
@ApiForbiddenResponse({ description: 'Not authorized as company or company staff' })
export class DashboardController {
  constructor(private readonly service: DashboardService) {}
  @ApiOperation({ summary: 'Company Dashboard KPI Summary Cards' })
  @ApiOkResponse({
    description: 'KPI summary cards (guards, incidents, visitors, cameras, sites, compliance)',
    schema: {
      example: {
        activeGuards: { total: 142, onPatrolNow: 12 },
        openIncidents: { total: 7, critical: 2 },
        visitorsToday: { total: 38, pending: 5 },
        camerasOnline: { percentage: 98, offline: 2, total: 100 },
        sitesCovered: { total: 14, active: 14, subtitle: 'All active' },
        patrolCompliance: { percentage: 96, subtitle: 'This week' },
      },
    },
  })
  @Get('summary')
  async summary(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.service.summary(user.companyId!);
  }
  @ApiOperation({ summary: 'Recent Incidents and Critical Banner' })
  @ApiOkResponse({
    description: 'Critical alert banner details and recent incidents list',
    schema: {
      example: {
        openCount: 7,
        criticalAlert: {
          id: 'incident-uuid',
          referenceNumber: '#1044',
          title: 'Fire alarm triggered',
          description: 'Fire alarm active on Block C',
          severity: 'CRITICAL',
          status: 'REPORTED',
          location: 'Block C — Lagos HQ',
          occurredAt: '2026-09-28T09:14:00.000Z',
        },
        incidents: [
          {
            id: 'incident-uuid-1',
            referenceNumber: '#1044',
            title: 'Fire alarm triggered',
            type: 'FIRE',
            severity: 'CRITICAL',
            status: 'REPORTED',
            location: 'Block C • Lagos HQ',
            occurredAt: '2026-09-28T09:14:00.000Z',
            siteName: 'Lagos HQ',
            clientName: 'Apex Security Ltd',
            isEscalated: false,
          },
        ],
      },
    },
  })
  @Get('recent-incidents')
  async recentIncidents(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.service.recentIncidents(user.companyId!);
  }
  @ApiOperation({ summary: 'Weekly Performance Metrics Table' })
  @ApiOkResponse({
    description: 'Weekly performance metric comparisons (current, target, status)',
    schema: {
      example: [
        { metric: 'Patrol Compliance', current: '96%', target: '95%', status: 'Exceeding' },
        { metric: 'Incident Response Time', current: '2.4h', target: '2.0h', status: 'Lagging' },
        { metric: 'Visitor Processing Accuracy', current: '99%', target: '99%', status: 'On Target' },
        { metric: 'Camera Availability', current: '98%', target: '99%', status: 'Lagging' },
      ],
    },
  })
  @Get('weekly-performance')
  async weeklyPerformance(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.service.weeklyPerformance(user.companyId!);
  }
  @ApiOperation({ summary: 'Complete Consolidated Company Dashboard' })
  @Get('overview')
  async overview(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.service.overview(user.companyId!);
  }
}