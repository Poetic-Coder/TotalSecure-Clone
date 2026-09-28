import { PrismaService } from '@database/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { CompanyStatus, PlanTier } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly logger = new Logger(DashboardService.name);

  public async companySummary() {
    const companiesCount = await this.prisma.company.count({});
    const pendingCompaniesCount = await this.prisma.company.count({
      where: {
        status: 'PENDING_APPROVAL' as CompanyStatus,
      },
    });
    const activeComapaniesCount = await this.prisma.company.count({
      where: {
        status: 'ACTIVE' as CompanyStatus,
      },
    });
    const rejectedComapaniesCount = await this.prisma.company.count({
      where: {
        status: 'REJECTED' as CompanyStatus,
      },
    });
    const inactiveComapaniesCount = await this.prisma.company.count({
      where: {
        status: 'INACTIVE' as CompanyStatus,
      },
    });
    const suspendedComapaniesCount = await this.prisma.company.count({
      where: {
        status: 'SUSPENDED' as CompanyStatus,
      },
    });
    const churnedComapaniesCount = await this.prisma.company.count({
      where: {
        status: 'CHURNED' as CompanyStatus,
      },
    });

    const summary = {
      companies: {
        total: companiesCount,
        pending: pendingCompaniesCount,
        active: activeComapaniesCount,
        rejected: rejectedComapaniesCount,
        inactive: inactiveComapaniesCount,
        suspended: suspendedComapaniesCount,
        churned: churnedComapaniesCount,
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
      totalSites: sites
    };
    return returnedData
  }

    public async company() {
    const companies = await this.prisma.company.findMany({
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
    });

    const companyDetails = await Promise.all(
      companies.map(async (c) => {
        const [clientStaffCount, siteCount] = await Promise.all([
          this.prisma.clientStaff.count({
            where: { client: { companyId: c.id } },
          }),
          this.prisma.site.count({
            where: { client: { companyId: c.id } },
          }),
        ]);

        const totalUsers = c._count.guards + c._count.staff + clientStaffCount;

        return {
          id: c.id,
          name: c.name,
          status: c.status,
          plan: c.subscription?.plan?.tier ?? 'NONE',
          planName: c.subscription?.plan?.name ?? 'No Plan',
          users: totalUsers,
          guard: c._count.guards,
          site: siteCount,
        };
      }),
    );

    return companyDetails;
  }

  public async planExpiry() {
    const companySubscriptions = await this.prisma.companySubscription.findMany({
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
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingExpiration = companySubscriptions.reduce((acc, one) => {
      const targetDate = new Date(one.currentPeriodEnd);
      targetDate.setHours(0, 0, 0, 0);

      const diffTime = targetDate.getTime() - today.getTime();
      const expiryDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (expiryDay >= 0 && expiryDay <= 30) {
        acc.push({
          company: one.company,
          plan: one.plan,
          expirationDate: one.currentPeriodEnd,
          expirationDay: expiryDay,
        });
      }

      return acc;
    }, [] as { company: any; plan: any; expirationDate: Date; expirationDay: number }[]);

    return upcomingExpiration;
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
