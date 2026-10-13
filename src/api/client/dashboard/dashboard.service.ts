import { PrismaService } from '@database/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  CameraStatus,
  DeploymentStatus,
  IncidentSeverity,
  IncidentStatus,
  InvoiceStatus,
  PatrolStatus,
  VehicleStatus,
  VisitorStatus,
} from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 1. The 6 Core KPI Metric Cards for Client Premises
   * (Guards On Duty, Security Incidents, Visitors Today, Vehicles On Site, Sites Covered, Patrol Coverage)
   */
  public async summary(clientId: string) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      activeDeployments,
      patrolsInProgress,
      openIncidents,
      criticalIncidents,
      visitorsToday,
      visitorsCurrentlyInside,
      pendingVisitors,
      vehiclesInside,
      vehiclesToday,
      totalSites,
      activeSites,
      scheduledPatrols,
      completedPatrols,
    ] = await Promise.all([
      // Guards deployed to this client
      this.prisma.guard.count({
        where: {
          deployments: {
            some: {
              clientId,
              status: DeploymentStatus.ACTIVE,
            },
          },
        },
      }),

      // Guards actively on patrol now
      this.prisma.patrol.count({
        where: {
          deployment: { clientId },
          status: PatrolStatus.IN_PROGRESS,
        },
      }),

      // Open incidents at client sites
      this.prisma.incident.count({
        where: {
          clientId,
          status: {
            in: [
              IncidentStatus.REPORTED,
              IncidentStatus.UNDER_REVIEW,
              IncidentStatus.ESCALATED,
              IncidentStatus.INVESTIGATING,
            ],
          },
        },
      }),

      // Critical incidents
      this.prisma.incident.count({
        where: {
          clientId,
          severity: IncidentSeverity.CRITICAL,
          status: {
            in: [
              IncidentStatus.REPORTED,
              IncidentStatus.UNDER_REVIEW,
              IncidentStatus.ESCALATED,
              IncidentStatus.INVESTIGATING,
            ],
          },
        },
      }),

      // Visitors today
      this.prisma.visitorVisit.count({
        where: {
          visitor: { clientId },
          createdAt: { gte: startOfToday, lte: endOfToday },
        },
      }),

      // Visitors currently on premises
      this.prisma.visitorVisit.count({
        where: {
          visitor: { clientId },
          status: VisitorStatus.CHECKED_IN,
        },
      }),

      // Visitors awaiting gate approval
      this.prisma.visitorVisit.count({
        where: {
          visitor: { clientId },
          createdAt: { gte: startOfToday, lte: endOfToday },
          status: VisitorStatus.PENDING,
        },
      }),

      // Vehicles currently on premises
      this.prisma.vehicleEntry.count({
        where: {
          site: { clientId },
          status: VehicleStatus.INSIDE,
        },
      }),

      // Vehicle entries today
      this.prisma.vehicleEntry.count({
        where: {
          site: { clientId },
          entryTime: { gte: startOfToday, lte: endOfToday },
        },
      }),

      // Sites registered & active
      this.prisma.site.count({
        where: { clientId },
      }),
      this.prisma.site.count({
        where: { clientId, active: true },
      }),

      // Patrol compliance at client sites (past 7 days)
      this.prisma.patrol.count({
        where: {
          site: { clientId },
          scheduledStart: { gte: sevenDaysAgo },
        },
      }),
      this.prisma.patrol.count({
        where: {
          site: { clientId },
          scheduledStart: { gte: sevenDaysAgo },
          status: PatrolStatus.COMPLETED,
        },
      }),
    ]);

    const patrolCompliancePercentage =
      scheduledPatrols > 0
        ? Math.round((completedPatrols / scheduledPatrols) * 100)
        : 0;

    return {
      guardsOnDuty: {
        deployed: activeDeployments,
        onPatrolNow: patrolsInProgress,
        subtitle: `${activeDeployments} guards assigned`,
      },
      openIncidents: {
        total: openIncidents,
        critical: criticalIncidents,
        status:
          criticalIncidents > 0
            ? `${criticalIncidents} Critical Attention Needed`
            : openIncidents > 0
            ? `${openIncidents} Under Investigation`
            : 'All Clear',
      },
      visitorsToday: {
        total: visitorsToday,
        currentlyInside: visitorsCurrentlyInside,
        pendingApproval: pendingVisitors,
      },
      vehiclesOnSite: {
        currentlyInside: vehiclesInside,
        totalEntriesToday: vehiclesToday,
      },
      sitesCovered: {
        total: totalSites,
        active: activeSites,
        subtitle:
          activeSites === totalSites
            ? 'All monitored'
            : `${activeSites} of ${totalSites} active`,
      },
      patrolCompliance: {
        percentage: patrolCompliancePercentage,
        completedRounds: completedPatrols,
        scheduledRounds: scheduledPatrols,
        subtitle: 'This week',
      },
    };
  }

  /**
   * 2. Security Alerts & Recent Incidents at Client Facilities
   */
  public async recentIncidents(clientId: string) {
    const [openCount, criticalAlert, incidents] = await Promise.all([
      this.prisma.incident.count({
        where: {
          clientId,
          status: {
            in: [
              IncidentStatus.REPORTED,
              IncidentStatus.UNDER_REVIEW,
              IncidentStatus.ESCALATED,
              IncidentStatus.INVESTIGATING,
            ],
          },
        },
      }),

      // Top active critical incident
      this.prisma.incident.findFirst({
        where: {
          clientId,
          severity: IncidentSeverity.CRITICAL,
          status: {
            in: [
              IncidentStatus.REPORTED,
              IncidentStatus.UNDER_REVIEW,
              IncidentStatus.ESCALATED,
              IncidentStatus.INVESTIGATING,
            ],
          },
        },
        orderBy: { occurredAt: 'desc' },
        include: {
          site: { select: { id: true, name: true } },
        },
      }),

      // Recent 10 incidents
      this.prisma.incident.findMany({
        where: { clientId },
        orderBy: { occurredAt: 'desc' },
        take: 10,
        include: {
          site: { select: { id: true, name: true } },
        },
      }),
    ]);

    return {
      openCount,
      criticalAlert: criticalAlert
        ? {
            id: criticalAlert.id,
            referenceNumber: criticalAlert.referenceNumber,
            title: criticalAlert.title,
            description: criticalAlert.description,
            type: criticalAlert.type,
            severity: criticalAlert.severity,
            status: criticalAlert.status,
            siteName: criticalAlert.site?.name ?? 'Main Facility',
            location:
              criticalAlert.location ||
              criticalAlert.site?.name ||
              'On premises',
            occurredAt: criticalAlert.occurredAt,
            isEscalated: criticalAlert.isEscalated,
          }
        : null,
      incidents: incidents.map((item) => ({
        id: item.id,
        referenceNumber: item.referenceNumber,
        title: item.title,
        type: item.type,
        severity: item.severity,
        status: item.status,
        siteName: item.site?.name ?? 'Main Site',
        location: item.location || item.site?.name || 'On premises',
        occurredAt: item.occurredAt,
        isEscalated: item.isEscalated,
      })),
    };
  }

  /**
   * 3. Today's Gate Activity (Recent Visitors & Vehicles)
   */
  public async gateActivity(clientId: string) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [recentVisits, recentVehicles] = await Promise.all([
      // Last 10 visitor visits today
      this.prisma.visitorVisit.findMany({
        where: {
          visitor: { clientId },
          createdAt: { gte: startOfToday },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          visitor: {
            select: {
              firstName: true,
              lastName: true,
              phone: true,
              site: { select: { name: true } },
            },
          },
        },
      }),

      // Last 10 vehicle entries today
      this.prisma.vehicleEntry.findMany({
        where: {
          site: { clientId },
          entryTime: { gte: startOfToday },
        },
        orderBy: { entryTime: 'desc' },
        take: 10,
        include: {
          vehicle: {
            select: {
              plateNumber: true,
              make: true,
              model: true,
              color: true,
            },
          },
          site: { select: { name: true } },
        },
      }),
    ]);

    return {
      recentVisitors: recentVisits.map((v) => ({
        id: v.id,
        visitorName: `${v.visitor.firstName} ${v.visitor.lastName}`.trim(),
        phone: v.visitor.phone,
        hostName: v.hostName,
        hostDepartment: v.hostDepartment,
        purpose: v.purpose,
        badgeNumber: v.badgeNumber,
        status: v.status,
        checkInTime: v.checkInTime,
        checkOutTime: v.checkOutTime,
        siteName: v.visitor.site?.name ?? 'Main Gate',
      })),
      recentVehicles: recentVehicles.map((v) => ({
        id: v.id,
        plateNumber: v.vehicle?.plateNumber ?? 'Unknown Plate',
        vehicleModel: [v.vehicle?.make, v.vehicle?.model, v.vehicle?.color]
          .filter(Boolean)
          .join(' '),
        purpose: v.purpose,
        status: v.status,
        entryTime: v.entryTime,
        exitTime: v.exitTime,
        siteName: v.site?.name ?? 'Main Gate',
      })),
    };
  }

  /**
   * 4. Site-by-Site Operational Overview
   */
  /**
   * 4. Site-by-Site Operational Overview
   */
  public async sites(clientId: string) {
    const [sites, onlineCameraGroups] = await Promise.all([
      this.prisma.site.findMany({
        where: { clientId },
        select: {
          id: true,
          name: true,
          code: true,
          classification: true,
          address: true,
          active: true,
          patrols: {
            take: 1,
            orderBy: { scheduledStart: 'desc' },
            select: {
              status: true,
              completionRate: true,
              actualEnd: true,
            },
          },
          _count: {
            select: {
              deployments: { where: { status: DeploymentStatus.ACTIVE } },
              cameras: true,
              incidents: {
                where: {
                  status: {
                    in: [
                      IncidentStatus.REPORTED,
                      IncidentStatus.UNDER_REVIEW,
                      IncidentStatus.ESCALATED,
                      IncidentStatus.INVESTIGATING,
                    ],
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.camera.groupBy({
        by: ['siteId'],
        where: {
          site: { clientId },
          status: CameraStatus.ONLINE,
        },
        _count: {
          id: true,
        },
      }),
    ]);

    const onlineCameraMap = new Map<string, number>(
      onlineCameraGroups
        .filter((g) => g.siteId !== null)
        .map((g) => [g.siteId!, g._count.id]),
    );

    return sites.map((s) => {
      const lastPatrol = s.patrols[0] ?? null;
      const onlineCameras = onlineCameraMap.get(s.id) ?? 0;

      return {
        id: s.id,
        name: s.name,
        code: s.code,
        classification: s.classification,
        address: s.address,
        active: s.active,
        guardsAssigned: s._count.deployments,
        cameras: {
          total: s._count.cameras,
          online: onlineCameras,
        },
        openIncidents: s._count.incidents,
        lastPatrolStatus: lastPatrol?.status ?? 'NO_PATROLS',
        lastPatrolCompletionRate: lastPatrol?.completionRate ?? 0,
      };
    });
  }

  /**
   * 5. Invoicing & Account Manager Summary
   */
  public async billingSummary(clientId: string) {
    const [client, recentInvoices, pendingInvoices] = await Promise.all([
      this.prisma.client.findUnique({
        where: { id: clientId },
        select: {
          currency: true,
          subscription: {
            select: {
              status: true,
              startedAt: true,
              currentPeriodStart: true,
              currentPeriodEnd: true,
              package: {
                select: { name: true, tier: true },
              },
            },
          },
          accountManager: {
            select: {
              email: true,
              phone: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),

      this.prisma.invoice.findMany({
        where: { clientId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          invoiceNumber: true,
          period: true,
          status: true,
          totalAmount: true,
          amountDue: true,
          dueDate: true,
          paidAt: true,
        },
      }),

      this.prisma.invoice.findMany({
        where: {
          clientId,
          status: { in: [InvoiceStatus.SENT, InvoiceStatus.OVERDUE] },
        },
        select: { amountDue: true },
      }),
    ]);

    const totalOutstandingDue = pendingInvoices.reduce(
      (sum, inv) => sum + inv.amountDue,
      0,
    );

    return {
      outstandingBalance: totalOutstandingDue,
      currency: client?.currency ?? 'NGN',
      activeSubscription: client?.subscription
        ? {
            packageName:
              client.subscription.package?.name ?? 'Standard Security',
            status: client.subscription.status,
            renewalDate: client.subscription.currentPeriodEnd,
          }
        : null,
      accountManager: client?.accountManager
        ? {
            name:
              [
                client.accountManager.profile?.firstName,
                client.accountManager.profile?.lastName,
              ]
                .filter(Boolean)
                .join(' ') || 'Assigned Account Manager',
            email: client.accountManager.email,
            phone: client.accountManager.phone,
          }
        : null,
      recentInvoices,
    };
  }

  /**
   * 6. Consolidated Dashboard (One-stop fetch for Frontend)
   */
  public async overview(clientId: string, hasBillingAccess: boolean = false) {
    const [summary, incidentsData, gateActivity, billing] = await Promise.all([
      this.summary(clientId),
      this.recentIncidents(clientId),
      this.gateActivity(clientId),
      // Only run the heavy billing query if they have access
      hasBillingAccess ? this.billingSummary(clientId) : Promise.resolve(null),
    ]);

    return {
      summary,
      criticalAlert: incidentsData.criticalAlert,
      openIncidentsCount: incidentsData.openCount,
      recentIncidents: incidentsData.incidents,
      gateActivity,
      billing,
    };
  }

  /**
   * 7. Site only Incidents Overview (For Site Managers)
   */
   public async siteIncidentsOverview(clientId: string, siteId: string) {
    const openStatuses = [
      IncidentStatus.REPORTED,
      IncidentStatus.UNDER_REVIEW,
      IncidentStatus.ESCALATED,
      IncidentStatus.INVESTIGATING,
    ];

    const [openCount, criticalAlert, incidents] = await Promise.all([
      this.prisma.incident.count({
        where: {
          OR: [{ clientId }, { site: { clientId } }],
          siteId,
          status: { in: openStatuses },
        },
      }),
      // Use findFirst for the top banner alert
      this.prisma.incident.findFirst({
        where: {
          OR: [{ clientId }, { site: { clientId } }],
          siteId,
          severity: IncidentSeverity.CRITICAL,
          status: { in: openStatuses },
        },
        orderBy: { occurredAt: 'desc' },
        include: { site: { select: { name: true } } },
      }),
      this.prisma.incident.findMany({
        where: {
          OR: [{ clientId }, { site: { clientId } }],
          siteId,
        },
        orderBy: { occurredAt: 'desc' },
        take: 5,
        include: { site: { select: { name: true } } },
      }),
    ]);

    return {
      openCount,
      criticalAlert: criticalAlert
        ? {
            id: criticalAlert.id,
            referenceNumber: criticalAlert.referenceNumber,
            title: criticalAlert.title,
            description: criticalAlert.description,
            type: criticalAlert.type,
            severity: criticalAlert.severity,
            status: criticalAlert.status,
            siteName: criticalAlert.site?.name ?? 'Main Facility',
            location: criticalAlert.location || criticalAlert.site?.name || 'On premises',
            occurredAt: criticalAlert.occurredAt,
            isEscalated: criticalAlert.isEscalated,
          }
        : null,
      incidents: incidents.map((item) => ({
        id: item.id,
        referenceNumber: item.referenceNumber,
        title: item.title,
        type: item.type,
        severity: item.severity,
        status: item.status,
        siteName: item.site?.name ?? 'Main Site',
        location: item.location || item.site?.name || 'On premises',
        occurredAt: item.occurredAt,
        isEscalated: item.isEscalated,
      })),
    };
  }
}
