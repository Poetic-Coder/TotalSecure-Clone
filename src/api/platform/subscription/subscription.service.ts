import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { addDays, differenceInDays, isAfter } from 'date-fns';
import { CompanyStatus, SubscriptionStatus } from '@prisma/client';
import { EmailService } from '@modules/network/services/email/email.service';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  // ─── PRIVATE HELPERS ───────────────────────────────────────

  private getTrialDays(): number {
    return this.configService.get<number>('TRIAL_DAYS') ?? 30;
  }

  private getWarningDays(): number[] {
    const raw =
      this.configService.get<string>('TRIAL_EXPIRY_WARNING_DAYS') ?? '7,2';
    return raw.split(',').map(Number);
  }

  // ─── AUTO-ASSIGN TRIAL ON COMPANY REGISTRATION ─────────────
  // Called internally when a Company registers — not a public endpoint

  async assignTrialOnRegister(companyPk: number, companyId: string) {
    // Check if subscription already exists
    const existing = await this.prisma.companySubscription.findUnique({
      where: { companyId },
    });

    if (existing) return existing;

    // Find the FREE tier plan to assign as trial base
    const freePlan = await this.prisma.platformPlan.findFirst({
      where: { tier: 'FREE', active: true },
    });

    if (!freePlan) {
      throw new BadRequestException(['No FREE plan found']);
    }

    const trialDays = this.getTrialDays();
    const now = new Date();
    const trialEndsAt = addDays(now, trialDays);

    const subscription = await this.prisma.companySubscription.create({
      data: {
        status: SubscriptionStatus.TRIALING,
        billingCycle: 'MONTHLY',
        currentPeriodStart: now,
        currentPeriodEnd: trialEndsAt,
        trialEndsAt,
        companyPk,
        companyId,
        planPk: freePlan.pk,
        planId: freePlan.id,
      },
      include: { plan: true },
    });

    return subscription;
  }

  // ─── GET SUBSCRIPTION STATUS (endpoint 2) ──────────────────
  // PlatformStaff calls this to validate a company's plan status

  async getCompanySubscriptionStatus(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException(['Company not found']);
    }

    const subscription = await this.prisma.companySubscription.findUnique({
      where: { companyId },
      include: { plan: true },
    });

    if (!subscription) {
      return {
        companyId,
        companyName: company.name,
        hasSubscription: false,
        status: null,
        plan: null,
        message: 'No subscription found for this company',
      };
    }

    const now = new Date();
    const isTrialing = subscription.status === SubscriptionStatus.TRIALING;
    const isActive = subscription.status === SubscriptionStatus.ACTIVE;
    const isExpired = subscription.status === SubscriptionStatus.EXPIRED;
    const isPastDue = subscription.status === SubscriptionStatus.PAST_DUE;

    // Calculate days remaining
    const daysRemaining = differenceInDays(subscription.currentPeriodEnd, now);

    // Check if trial has expired but status not yet updated
    const trialExpired =
      isTrialing &&
      subscription.trialEndsAt &&
      isAfter(now, subscription.trialEndsAt);

    return {
      companyId,
      companyName: company.name,
      hasSubscription: true,
      status: trialExpired ? 'EXPIRED' : subscription.status,
      planType: isTrialing ? 'TRIAL' : 'PAID',
      isOnFreePlan: subscription.plan.tier === 'FREE',
      isOnPaidPlan: subscription.plan.tier !== 'FREE',
      isTrialing,
      isActive,
      isExpired: isExpired || trialExpired,
      isPastDue,
      plan: {
        id: subscription.plan.id,
        name: subscription.plan.name,
        tier: subscription.plan.tier,
        monthlyPrice: subscription.plan.monthlyPrice,
        currency: subscription.plan.currency,
      },
      billing: {
        cycle: subscription.billingCycle,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        daysRemaining: Math.max(0, daysRemaining),
        trialEndsAt: subscription.trialEndsAt,
        trialDaysTotal: this.getTrialDays(),
      },
      features: {
        hasGuardManagement: subscription.plan.hasGuardManagement,
        hasPatrolManagement: subscription.plan.hasPatrolManagement,
        hasVisitorManagement: subscription.plan.hasVisitorManagement,
        hasVehicleManagement: subscription.plan.hasVehicleManagement,
        hasIncidentManagement: subscription.plan.hasIncidentManagement,
        hasCctvIntegration: subscription.plan.hasCctvIntegration,
        hasCommandCenter: subscription.plan.hasCommandCenter,
        hasReporting: subscription.plan.hasReporting,
        hasAdvancedAnalytics: subscription.plan.hasAdvancedAnalytics,
        hasApiAccess: subscription.plan.hasApiAccess,
        hasBiometricCheckin: subscription.plan.hasBiometricCheckin,
        hasSmsAlerts: subscription.plan.hasSmsAlerts,
        hasEmailAlerts: subscription.plan.hasEmailAlerts,
        hasMultiBranch: subscription.plan.hasMultiBranch,
      },
      limits: {
        maxSites: subscription.plan.maxSites,
        maxGuardsDeployed: subscription.plan.maxGuardsDeployed,
        maxCameras: subscription.plan.maxCameras,
        maxStaffUsers: subscription.plan.maxStaffUsers,
        storageRetentionDays: subscription.plan.storageRetentionDays,
      },
    };
  }

  // ─── GET ALL COMPANY SUBSCRIPTIONS ─────────────────────────
  // PlatformStaff views all companies and their subscription status

  async getAllCompanySubscriptions() {
    const subscriptions = await this.prisma.companySubscription.findMany({
      include: {
        plan: true,
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter to include ACTIVE, PENDING_APPROVAL, and SUSPENDED
    const visibleSubs = subscriptions.filter(
      (sub) =>
        sub.company.status === CompanyStatus.ACTIVE ||
        sub.company.status === CompanyStatus.PENDING_APPROVAL ||
        sub.company.status === CompanyStatus.SUSPENDED,
    );

    const now = new Date();

    return visibleSubs.map((sub) => {
      const daysRemaining = differenceInDays(sub.currentPeriodEnd, now);
      const trialExpired =
        sub.status === 'TRIALING' &&
        sub.trialEndsAt &&
        isAfter(now, sub.trialEndsAt);

      return {
        company: sub.company,
        status: trialExpired ? 'EXPIRED' : sub.status,
        plan: sub.plan.name,
        tier: sub.plan.tier,
        daysRemaining: Math.max(0, daysRemaining),
        trialEndsAt: sub.trialEndsAt,
        currentPeriodEnd: sub.currentPeriodEnd,
      };
    });
  }

  // ─── ASSIGN PAID PLAN ──────────────────────────────────────
  // PlatformStaff upgrades a company to a paid plan

  async assignPaidPlan(
    companyId: string,
    planId: string,
    billingCycle: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY',
  ) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException(['Company not found']);
    }

    const plan = await this.prisma.platformPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.active) {
      throw new NotFoundException(['Plan not found or inactive']);
    }

    const now = new Date();
    let periodEnd: Date;

    if (billingCycle === 'MONTHLY') periodEnd = addDays(now, 30);
    else if (billingCycle === 'QUARTERLY') periodEnd = addDays(now, 90);
    else periodEnd = addDays(now, 365);

    // Upsert — create if not exists, update if exists
    const subscription = await this.prisma.companySubscription.upsert({
      where: { companyId },
      create: {
        status: SubscriptionStatus.ACTIVE,
        billingCycle,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        companyPk: company.pk,
        companyId: company.id,
        planPk: plan.pk,
        planId: plan.id,
      },
      update: {
        status: SubscriptionStatus.ACTIVE,
        billingCycle,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        planPk: plan.pk,
        planId: plan.id,
        trialEndsAt: null, // clear trial end date on upgrade
      },
      include: { plan: true },
    });

    await this.prisma.company.update({
      where: { id: companyId },
      data: { status: CompanyStatus.ACTIVE },
    });

    return {
      message: `Company successfully upgraded to ${plan.name}`,
      subscription,
    };
  }

  // ─── EXPIRE TRIAL (called by cron) ─────────────────────────

  async expireTrials() {
    const now = new Date();

    // Find all TRIALING subscriptions where trial has ended
    const expiredTrials = await this.prisma.companySubscription.findMany({
      where: {
        status: SubscriptionStatus.TRIALING,
        trialEndsAt: { lte: now },
      },
      include: {
        company: true,
        plan: true,
      },
    });

    if (expiredTrials.length === 0) return;

    await this.prisma.$transaction(async (tx) => {
      // Expire subscriptions
      await tx.companySubscription.updateMany({
        where: {
          status: SubscriptionStatus.TRIALING,
          trialEndsAt: { lte: now },
        },
        data: { status: SubscriptionStatus.EXPIRED },
      });

      // Suspend companies linked to those subscriptions
      const companyIds = expiredTrials.map((s) => s.company.id);
      await tx.company.updateMany({
        where: { id: { in: companyIds } },
        data: { status: CompanyStatus.SUSPENDED },
      });
    });

    // Send expiry emails
    for (const sub of expiredTrials) {
      try {
        await this.emailService.sendCustomEmail(
          sub.company.email,
          {
            subject: 'Your TSNL trial has expired',
            full_name: sub.company.name,
            title: 'Trial Expired',
            content: `Your ${this.getTrialDays()}-day free trial has ended. Please contact us to upgrade your plan and restore access to your account.`,
          },
          [],
        );
      } catch (error) {
        console.error(
          `Failed to send expiry email to ${sub.company.email}:`,
          error.message,
        );
      }
    }

    return { expired: expiredTrials.length };
  }

  // ─── WARN EXPIRING TRIALS (called by cron) ─────────────────

  async warnExpiringTrials() {
    const now = new Date();
    const warningDays = this.getWarningDays();

    for (const days of warningDays) {
      const targetDate = addDays(now, days);

      // Find trials expiring in exactly X days
      const expiringSubscriptions =
        await this.prisma.companySubscription.findMany({
          where: {
            status: SubscriptionStatus.TRIALING,
            trialEndsAt: {
              gte: new Date(targetDate.setHours(0, 0, 0, 0)),
              lte: new Date(targetDate.setHours(23, 59, 59, 999)),
            },
          },
          include: { company: true },
        });

      for (const sub of expiringSubscriptions) {
        try {
          await this.emailService.sendCustomEmail(
            sub.company.email,
            {
              subject: `Your TSNL trial expires in ${days} day${
                days > 1 ? 's' : ''
              }`,
              full_name: sub.company.name,
              title: `Trial Expiring Soon`,
              content: `Your free trial expires in ${days} day${
                days > 1 ? 's' : ''
              }. Upgrade now to keep access to all features and avoid service interruption.`,
            },
            [],
          );
        } catch (error) {
          console.error(
            `Failed to send warning email to ${sub.company.email}:`,
            error.message,
          );
        }
      }
    }
  }
}
