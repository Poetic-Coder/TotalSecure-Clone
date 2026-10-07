import { RolesGuard } from '@api/common/auth/guards/role.guard';
import { AuthUserInterceptor } from '@api/common/auth/interceptors/authenticated-account.interceptor';
import { CurrentUser } from '@common/decorators/current-user';
import { ApiHeaders } from '@common/decorators/defaultHeaders';
import { Roles } from '@common/decorators/role.decorator';
import { AccountType } from '@common/enums';
import { AuthenticatedRequestUser } from '@common/interfaces';
import {
  Controller,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Client Dashboard')
@Controller('client/dashboard')
@ApiHeaders()
@ApiBearerAuth('bearer')
@ApiSecurity('api-key')
@UseInterceptors(AuthUserInterceptor)
@UseGuards(RolesGuard)
@Roles(AccountType.CLIENT, AccountType.CLIENT_STAFF)
@ApiForbiddenResponse({
  description: 'Not authorized as Client or Client Staff',
})
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  private getClientId(user: AuthenticatedRequestUser): string {
    return user.clientId ?? user.id;
  }

  @ApiOperation({ summary: 'Client Dashboard KPI Summary Cards' })
  @ApiOkResponse({
    description:
      'Summary cards for client premises (guards, incidents, visitors, vehicles, sites, compliance)',
    schema: {
      example: {
        guardsOnDuty: {
          deployed: 18,
          onPatrolNow: 4,
          subtitle: '18 guards assigned',
        },
        openIncidents: {
          total: 1,
          critical: 0,
          status: '1 Under Investigation',
        },
        visitorsToday: { total: 42, currentlyInside: 14, pendingApproval: 3 },
        vehiclesOnSite: { currentlyInside: 28, totalEntriesToday: 65 },
        sitesCovered: { total: 3, active: 3, subtitle: 'All monitored' },
        patrolCompliance: {
          percentage: 98,
          completedRounds: 34,
          scheduledRounds: 35,
          subtitle: 'This week',
        },
      },
    },
  })
  @Get('summary')
  async summary(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.service.summary(this.getClientId(user));
  }

  @ApiOperation({ summary: 'Recent Incidents at Client Facilities' })
  @ApiOkResponse({
    description: 'Critical alert banner details and recent incidents list',
    schema: {
      example: {
        openCount: 1,
        criticalAlert: null,
        incidents: [
          {
            id: 'incident-uuid-1',
            referenceNumber: '#1045',
            title: 'Unauthorised access attempt',
            type: 'ACCESS_VIOLATION',
            severity: 'HIGH',
            status: 'REPORTED',
            siteName: 'Main Branch',
            location: 'Gate 2 • Main Branch',
            occurredAt: '2026-09-28T07:15:00.000Z',
            isEscalated: false,
          },
        ],
      },
    },
  })
  @Get('incidents')
  async recentIncidents(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.service.recentIncidents(this.getClientId(user));
  }

  @ApiOperation({ summary: "Today's Gate Activity (Visitors & Vehicles)" })
  @ApiOkResponse({
    description: 'Recent visitor and vehicle entries logged today',
    schema: {
      example: {
        recentVisitors: [
          {
            id: 'visit-uuid',
            visitorName: 'John Doe',
            phone: '+2348012345678',
            hostName: 'Operations Dept',
            purpose: 'Site Inspection',
            badgeNumber: 'V-102',
            status: 'CHECKED_IN',
            checkInTime: '2026-09-28T08:30:00.000Z',
            siteName: 'Victoria Island HQ',
          },
        ],
        recentVehicles: [
          {
            id: 'vehicle-uuid',
            plateNumber: 'ABC-123XY',
            vehicleModel: 'Toyota Hilux White',
            purpose: 'Delivery',
            status: 'INSIDE',
            entryTime: '2026-09-28T08:15:00.000Z',
            siteName: 'Victoria Island HQ',
          },
        ],
      },
    },
  })
  @Get('gate-activity')
  async gateActivity(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.service.gateActivity(this.getClientId(user));
  }

  @ApiOperation({ summary: 'Site-by-Site Operational Status' })
  @ApiOkResponse({
    description: 'List of client sites with guard, camera, and incident status',
    schema: {
      example: [
        {
          id: 'site-uuid',
          name: 'Victoria Island HQ',
          code: 'VI-HQ-01',
          classification: 'COMMERCIAL',
          address: '14 Marina St, Victoria Island',
          active: true,
          guardsAssigned: 8,
          cameras: { total: 16, online: 16 },
          openIncidents: 0,
          lastPatrolStatus: 'COMPLETED',
          lastPatrolCompletionRate: 100,
        },
      ],
    },
  })
  @Get('sites')
  async sites(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.service.sites(this.getClientId(user));
  }

  @ApiOperation({ summary: 'Billing & Account Manager Summary' })
  @ApiOkResponse({
    description:
      'Outstanding invoices balance, subscription status, and account manager details',
    schema: {
      example: {
        outstandingBalance: 350000,
        currency: 'NGN',
        activeSubscription: {
          packageName: 'Corporate Enterprise Security',
          status: 'ACTIVE',
          renewalDate: '2026-12-31T00:00:00.000Z',
        },
        accountManager: {
          name: 'Sarah Williams',
          email: 'sarah.williams@totalsecure.ng',
          phone: '+2348099887766',
        },
        recentInvoices: [
          {
            id: 'inv-uuid',
            invoiceNumber: 'INV-2026-09-001',
            period: '2026-09',
            status: 'SENT',
            totalAmount: 350000,
            amountDue: 350000,
            dueDate: '2026-10-15T00:00:00.000Z',
            paidAt: null,
          },
        ],
      },
    },
  })
  @Get('billing')
  async billingSummary(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.service.billingSummary(this.getClientId(user));
  }

  @ApiOperation({ summary: 'Complete Consolidated Client Dashboard' })
  @Get('overview')
  async overview(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.service.overview(this.getClientId(user));
  }

  @ApiOperation({ summary: 'Site Incident Overview (For Site Managers)' })
  @ApiParam({
    name: 'siteId',
    description: 'Unique UUID of the site',
    type: String,
    example: 'b4a8e23f-5d1c-4b92-91e8-782a945112fa',
  })
  @ApiOkResponse({
    description:
      'Incident counts and recent incidents list scoped to a specific site',
    schema: {
      example: {
        openCount: 2,
        criticalAlert: 1,
        incidents: [
          {
            id: 'incident-uuid-1',
            referenceNumber: '#1052',
            title: 'Unauthorized perimeter breach',
            severity: 'CRITICAL',
            status: 'REPORTED',
            createdAt: '2026-10-07T08:30:00.000Z',
          },
        ],
      },
    },
  })
  @Get('sites/:siteId/incidents')
  async siteIncidentsOverview(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('siteId') siteId: string,
  ) {
    return this.service.siteIncidentsOverview(this.getClientId(user), siteId);
  }
}
