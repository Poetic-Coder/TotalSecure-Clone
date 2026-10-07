import { PrismaService } from '@database/prisma.service';
import { Injectable } from '@nestjs/common';
import { CompanyStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  public async companySummary() {
    const companiesCount = await this.prisma.company.count({});
    const pendingCompaniesCount = await this.prisma.company.count({
      where: {
        status: 'PENDING_APPROVAL' as CompanyStatus,
      },
    });
    const activeCompaniesCount = await this.prisma.company.count({
      where: {
        status: 'ACTIVE' as CompanyStatus,
      },
    });
    const rejectedCompaniesCount = await this.prisma.company.count({
      where: {
        status: 'REJECTED' as CompanyStatus,
      },
    });
    const inactiveCompaniesCount = await this.prisma.company.count({
      where: {
        status: 'INACTIVE' as CompanyStatus,
      },
    });
    const suspendedCompaniesCount = await this.prisma.company.count({
      where: {
        status: 'SUSPENDED' as CompanyStatus,
      },
    });
    const churnedCompaniesCount = await this.prisma.company.count({
      where: {
        status: 'CHURNED' as CompanyStatus,
      },
    });

    const summary = {
      companies: {
        total: companiesCount,
        pending: pendingCompaniesCount,
        active: activeCompaniesCount,
        rejected: rejectedCompaniesCount,
        inactive: inactiveCompaniesCount,
        suspended: suspendedCompaniesCount,
        churned: churnedCompaniesCount,
      },
    };
    return summary;
  }

  public async totalUsers() {
    const [staffs, guards, clientStaffs] = await Promise.all([
      this.prisma.staff.count({}),
      this.prisma.guard.count({}),
      this.prisma.clientStaff.count({}),
    ]);
    const users = {
      staffs,
      guards,
      clientStaffs,
    };
    return users;
  }

  public async sites() {
    const sites = await this.prisma.site.count({});
    const returnedData = {
      totalSites: sites,
    };
    return returnedData;
  }

  public async company() {
    const [companies, clients] = await Promise.all([
      this.prisma.company.findMany({
        select: {
          id: true,
          name: true,
          status: true,
          subscription: {
            select: {
              plan: {
                select: {
                  tier: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              guards: true,
              staff: true,
            },
          },
        },
      }),
      this.prisma.client.findMany({
        select: {
          companyId: true,
          _count: {
            select: {
              clientStaff: true,
              sites: true,
            },
          },
        },
      }),
    ]);

    // Aggregate clientStaff and sites by companyId in memory
    const clientAggregates = new Map<
      string,
      { clientStaffCount: number; siteCount: number }
    >();
    for (const client of clients) {
      const stats = clientAggregates.get(client.companyId) ?? {
        clientStaffCount: 0,
        siteCount: 0,
      };
      stats.clientStaffCount += client._count.clientStaff;
      stats.siteCount += client._count.sites;
      clientAggregates.set(client.companyId, stats);
    }

    return companies.map((c) => {
      const stats = clientAggregates.get(c.id) ?? {
        clientStaffCount: 0,
        siteCount: 0,
      };
      const totalUsers =
        c._count.guards + c._count.staff + stats.clientStaffCount;

      return {
        id: c.id,
        name: c.name,
        status: c.status,
        plan: c.subscription?.plan?.tier ?? 'NONE',
        planName: c.subscription?.plan?.name ?? 'No Plan',
        users: totalUsers,
        guard: c._count.guards,
        site: stats.siteCount,
      };
    });
  }

  public async planExpiry() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const in30Days = new Date(today);
    in30Days.setDate(in30Days.getDate() + 30);
    in30Days.setHours(23, 59, 59, 999);

    const companySubscriptions = await this.prisma.companySubscription.findMany(
      {
        where: {
          currentPeriodEnd: {
            gte: today,
            lte: in30Days,
          },
        },
        orderBy: {
          currentPeriodEnd: 'asc',
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              logo: true,
              status: true,
            },
          },
          plan: {
            select: {
              name: true,
              tier: true,
            },
          },
        },
      },
    );

    return companySubscriptions.map((sub) => {
      const targetDate = new Date(sub.currentPeriodEnd);
      targetDate.setHours(0, 0, 0, 0);
      const diffTime = targetDate.getTime() - today.getTime();
      const expirationDay = Math.max(
        0,
        Math.ceil(diffTime / (1000 * 60 * 60 * 24)),
      );

      return {
        company: sub.company,
        plan: sub.plan,
        expirationDate: sub.currentPeriodEnd,
        expirationDay,
      };
    });
  }

  //   public async billingAndSubsciptionSummary() {
  //     const freePlan = await this.prisma.platformPlan.findFirst({
  //       where: { tier: 'FREE' },
  //     });
  //     const starterePlan = await this.prisma.platformPlan.findFirst({
  //       where: { tier: 'STARTER' },
  //     });
  //     const proPlan = await this.prisma.platformPlan.findFirst({
  //       where: { tier: 'PROFESSIONAL' },
  //     });
  //     const enterprisePlan = await this.prisma.platformPlan.findFirst({
  //       where: { tier: 'ENTERPRISE' },
  //     });
  //     const freePlanCount = await this.prisma.companySubscription.count({
  //       where: { plan: freePlan },
  //     });
  //     const starterPlanCount = await this.prisma.companySubscription.count({
  //       where: { plan: starterePlan },
  //     });
  //     const proPlanCount = await this.prisma.companySubscription.count({
  //       where: { plan: proPlan },
  //     });
  //     const orgPlanCount = await this.prisma.companySubscription.count({
  //       where: { plan: enterprisePlan },
  //     });
  //     const trial = await this.prisma.companySubscription.count({
  //       where: { status: 'TRIALING' },
  //     });
  //     const active = await this.prisma.companySubscription.count({
  //       where: { status: 'ACTIVE' },
  //     });
  //     const pastDue = await this.prisma.companySubscription.count({
  //       where: { status: 'PAST_DUE' },
  //     });
  //     const cancelled = await this.prisma.companySubscription.count({
  //       where: { status: 'CANCELLED' },
  //     });
  //     const expired = await this.prisma.companySubscription.count({
  //       where: { status: 'EXPIRED' },
  //     });
  //     const monthly = await this.prisma.companySubscription.count({
  //       where: { billingCycle: 'MONTHLY' },
  //     });
  //     const quaterly = await this.prisma.companySubscription.count({
  //       where: { billingCycle: 'QUARTERLY' },
  //     });
  //     const annually = await this.prisma.companySubscription.count({
  //       where: { billingCycle: 'ANNUALLY' },
  //     });
  //     const subscriptionSummary = {
  //       subscriptionPlans: {
  //         starter: starterPlanCount,
  //         free: freePlanCount,
  //         professional: proPlanCount,
  //         enterprise: orgPlanCount,
  //       },
  //       status: {
  //         trial,
  //         active,
  //         pastDue,
  //         cancelled,
  //         expired,
  //       },
  //       billingCycle: {
  //         monthlyCycle: monthly,
  //         quaterlyCycle: quaterly,
  //         annualCycle: annually,
  //       },
  //     };
  //     return subscriptionSummary;
  //   }
}
