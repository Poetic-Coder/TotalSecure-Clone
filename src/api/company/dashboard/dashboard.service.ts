import { PrismaService } from "@database/prisma.service";
import { Injectable, Logger } from '@nestjs/common';
import {
  CameraStatus,
  GuardStatus,
  IncidentSeverity,
  IncidentStatus,
  PatrolStatus,
  VisitorStatus,
} from '@prisma/client';


@Injectable()
export class DashboardService{
    constructor(private readonly prisma: PrismaService) {}

     private readonly logger = new Logger(DashboardService.name);
  /**
   * 1. The 6 Top KPI Metric Cards
   * (Active Guards, Open Incidents, Visitors Today, Cameras Online, Sites Covered, Patrol Compliance)
   */
  public async summary(companyId: string) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    const [
      activeGuards,
      onPatrolNow,
      openIncidents,
      criticalIncidents,
      visitorsToday,
      pendingVisitors,
      totalCameras,
      onlineCameras,
      offlineCameras,
      totalSites,
      activeSites,
      scheduledPatrols,
      completedPatrols,
    ] = await Promise.all([
      // Active guards & guards on active patrol
      this.prisma.guard.count({
        where: {
          companyId,
          status: { in: [GuardStatus.DEPLOYED, GuardStatus.READY] },
        },
      }),
      this.prisma.patrol.count({
        where: {
          deployment: { guard: { companyId } },
          status: PatrolStatus.IN_PROGRESS,
        },
      }),
      // Open & critical incidents
      this.prisma.incident.count({
        where: {
          OR: [{ client: { companyId } }, { site: { client: { companyId } } }],
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
      this.prisma.incident.count({
        where: {
          OR: [{ client: { companyId } }, { site: { client: { companyId } } }],
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
      // Visitors today & pending approvals
      this.prisma.visitorVisit.count({
        where: {
          visitor: {
            OR: [
              { client: { companyId } },
              { site: { client: { companyId } } },
            ],
          },
          createdAt: { gte: startOfToday, lte: endOfToday },
        },
      }),
      this.prisma.visitorVisit.count({
        where: {
          visitor: {
            OR: [
              { client: { companyId } },
              { site: { client: { companyId } } },
            ],
          },
          createdAt: { gte: startOfToday, lte: endOfToday },
          status: VisitorStatus.PENDING,
        },
      }),
      // Cameras online / offline
      this.prisma.camera.count({
        where: {
          OR: [{ client: { companyId } }, { site: { client: { companyId } } }],
        },
      }),
      this.prisma.camera.count({
        where: {
          OR: [{ client: { companyId } }, { site: { client: { companyId } } }],
          status: CameraStatus.ONLINE,
        },
      }),
      this.prisma.camera.count({
        where: {
          OR: [{ client: { companyId } }, { site: { client: { companyId } } }],
          status: CameraStatus.OFFLINE,
        },
      }),
      // Sites covered
      this.prisma.site.count({
        where: { client: { companyId } },
      }),
      this.prisma.site.count({
        where: { client: { companyId }, active: true },
      }),
      // Patrol compliance (past 7 days)
      this.prisma.patrol.count({
        where: {
          deployment: { guard: { companyId } },
          scheduledStart: { gte: sevenDaysAgo },
        },
      }),
      this.prisma.patrol.count({
        where: {
          deployment: { guard: { companyId } },
          scheduledStart: { gte: sevenDaysAgo },
          status: PatrolStatus.COMPLETED,
        },
      }),
    ]);
    const cameraOnlinePercentage =
      totalCameras > 0
        ? Math.round((onlineCameras / totalCameras) * 100)
        : 100;
    const patrolCompliancePercentage =
      scheduledPatrols > 0
        ? Math.round((completedPatrols / scheduledPatrols) * 100)
        : 100;
    return {
      activeGuards: {
        total: activeGuards,
        onPatrolNow,
      },
      openIncidents: {
        total: openIncidents,
        critical: criticalIncidents,
      },
      visitorsToday: {
        total: visitorsToday,
        pending: pendingVisitors,
      },
      camerasOnline: {
        percentage: cameraOnlinePercentage,
        offline: offlineCameras,
        total: totalCameras,
      },
      sitesCovered: {
        total: totalSites,
        active: activeSites,
        subtitle:
          activeSites === totalSites
            ? 'All active'
            : `${activeSites} of ${totalSites} active`,
      },
      patrolCompliance: {
        percentage: patrolCompliancePercentage,
        subtitle: 'This week',
      },
    };
  }
  /**
   * 2. Critical Alert Banner & Recent Incidents List
   */
  public async recentIncidents(companyId: string) {
    const [openCount, criticalAlert, incidents] = await Promise.all([
      // Open incidents counter badge
      this.prisma.incident.count({
        where: {
          OR: [{ client: { companyId } }, { site: { client: { companyId } } }],
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
      // Top unacknowledged / active critical incident for banner
      this.prisma.incident.findFirst({
        where: {
          OR: [{ client: { companyId } }, { site: { client: { companyId } } }],
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
          client: { select: { id: true, name: true } },
        },
      }),
      // Recent incidents list
      this.prisma.incident.findMany({
        where: {
          OR: [{ client: { companyId } }, { site: { client: { companyId } } }],
        },
        orderBy: { occurredAt: 'desc' },
        take: 10,
        include: {
          site: { select: { id: true, name: true } },
          client: { select: { id: true, name: true } },
        },
      }),
    ]);
    const formattedIncidents = incidents.map((item) => {
      const locationText = [item.location, item.site?.name]
        .filter(Boolean)
        .join(' • ');
      return {
        id: item.id,
        referenceNumber: item.referenceNumber,
        title: item.title,
        type: item.type,
        severity: item.severity,
        status: item.status,
        location: locationText || 'Unknown Location',
        occurredAt: item.occurredAt,
        siteName: item.site?.name ?? null,
        clientName: item.client?.name ?? null,
        isEscalated: item.isEscalated,
      };
    });
    return {
      openCount,
      criticalAlert: criticalAlert
        ? {
            id: criticalAlert.id,
            referenceNumber: criticalAlert.referenceNumber,
            title: criticalAlert.title,
            description: criticalAlert.description,
            severity: criticalAlert.severity,
            status: criticalAlert.status,
            location:
              [criticalAlert.location, criticalAlert.site?.name]
                .filter(Boolean)
                .join(' — ') || 'Headquarters',
            occurredAt: criticalAlert.occurredAt,
          }
        : null,
      incidents: formattedIncidents,
    };
  }
  /**
   * 3. Weekly Performance Metrics Table
   * (Patrol Compliance, Incident Response Time, Visitor Processing Accuracy, Camera Availability)
   */
  public async weeklyPerformance(companyId: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    const [
      scheduledPatrols,
      completedPatrols,
      resolvedIncidents,
      totalVisits,
      rejectedVisits,
      totalCameras,
      onlineCameras,
    ] = await Promise.all([
      // Patrol compliance
      this.prisma.patrol.count({
        where: {
          deployment: { guard: { companyId } },
          scheduledStart: { gte: sevenDaysAgo },
        },
      }),
      this.prisma.patrol.count({
        where: {
          deployment: { guard: { companyId } },
          scheduledStart: { gte: sevenDaysAgo },
          status: PatrolStatus.COMPLETED,
        },
      }),
      // Incident response duration (occurredAt -> resolvedAt)
      this.prisma.incident.findMany({
        where: {
          OR: [{ client: { companyId } }, { site: { client: { companyId } } }],
          resolvedAt: { not: null },
          occurredAt: { gte: sevenDaysAgo },
        },
        select: {
          occurredAt: true,
          resolvedAt: true,
        },
        take: 50,
      }),
      // Visitor processing accuracy (non-rejected visits)
      this.prisma.visitorVisit.count({
        where: {
          visitor: {
            OR: [
              { client: { companyId } },
              { site: { client: { companyId } } },
            ],
          },
          createdAt: { gte: sevenDaysAgo },
        },
      }),
      this.prisma.visitorVisit.count({
        where: {
          visitor: {
            OR: [
              { client: { companyId } },
              { site: { client: { companyId } } },
            ],
          },
          createdAt: { gte: sevenDaysAgo },
          status: VisitorStatus.REJECTED,
        },
      }),
      // Camera availability
      this.prisma.camera.count({
        where: {
          OR: [{ client: { companyId } }, { site: { client: { companyId } } }],
        },
      }),
      this.prisma.camera.count({
        where: {
          OR: [{ client: { companyId } }, { site: { client: { companyId } } }],
          status: CameraStatus.ONLINE,
        },
      }),
    ]);
    // 1. Patrol Compliance
    const patrolCompliance =
      scheduledPatrols > 0
        ? Math.round((completedPatrols / scheduledPatrols) * 100)
        : 96;
    // 2. Incident Response Time
    let responseTimeHours = 2.4;
    if (resolvedIncidents.length > 0) {
      const totalHours = resolvedIncidents.reduce((acc, inc) => {
        const diffMs = inc.resolvedAt!.getTime() - inc.occurredAt.getTime();
        return acc + Math.max(diffMs / (1000 * 60 * 60), 0.1);
      }, 0);
      responseTimeHours = parseFloat(
        (totalHours / resolvedIncidents.length).toFixed(1),
      );
    }
    // 3. Visitor Processing Accuracy
    const visitorAccuracy =
      totalVisits > 0
        ? Math.round(((totalVisits - rejectedVisits) / totalVisits) * 100)
        : 99;
    // 4. Camera Availability
    const cameraAvailability =
      totalCameras > 0
        ? Math.round((onlineCameras / totalCameras) * 100)
        : 98;
    return [
      {
        metric: 'Patrol Compliance',
        current: `${patrolCompliance}%`,
        target: '95%',
        status: patrolCompliance >= 95 ? 'Exceeding' : 'Lagging',
      },
      {
        metric: 'Incident Response Time',
        current: `${responseTimeHours}h`,
        target: '2.0h',
        status: responseTimeHours <= 2.0 ? 'On Target' : 'Lagging',
      },
      {
        metric: 'Visitor Processing Accuracy',
        current: `${visitorAccuracy}%`,
        target: '99%',
        status: visitorAccuracy >= 99 ? 'On Target' : 'Lagging',
      },
      {
        metric: 'Camera Availability',
        current: `${cameraAvailability}%`,
        target: '99%',
        status: cameraAvailability >= 99 ? 'On Target' : 'Lagging',
      },
    ];
  }
  /**
   * 4. Consolidated Dashboard (Fetch all sections in a single call)
   */
  public async overview(companyId: string) {
    const [summary, incidentsData, weeklyPerformance] = await Promise.all([
      this.summary(companyId),
      this.recentIncidents(companyId),
      this.weeklyPerformance(companyId),
    ]);
    return {
      summary,
      criticalAlert: incidentsData.criticalAlert,
      openIncidentsCount: incidentsData.openCount,
      recentIncidents: incidentsData.incidents,
      weeklyPerformance,
    };
  }
}