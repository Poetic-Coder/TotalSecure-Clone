import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreatePlatformPlanDto } from './dto/create-plan.dto';
import { UpdatePlatformPlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── CREATE ────────────────────────────────────────────────

  async create(dto: CreatePlatformPlanDto) {
    const existing = await this.prisma.platformPlan.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException([
        `A plan named "${dto.name}" already exists`,
      ]);
    }

    return this.prisma.platformPlan.create({
      data: {
        name: dto.name,
        tier: dto.tier,
        description: dto.description,
        monthlyPrice: dto.monthlyPrice,
        quarterlyPrice: dto.quarterlyPrice,
        annualPrice: dto.annualPrice,
        currency: dto.currency ?? 'NGN',
        hasGuardManagement: dto.hasGuardManagement ?? true,
        hasPatrolManagement: dto.hasPatrolManagement ?? true,
        hasVisitorManagement: dto.hasVisitorManagement ?? true,
        hasVehicleManagement: dto.hasVehicleManagement ?? true,
        hasIncidentManagement: dto.hasIncidentManagement ?? true,
        hasCctvIntegration: dto.hasCctvIntegration ?? false,
        hasCommandCenter: dto.hasCommandCenter ?? false,
        hasReporting: dto.hasReporting ?? true,
        hasAdvancedAnalytics: dto.hasAdvancedAnalytics ?? false,
        hasApiAccess: dto.hasApiAccess ?? false,
        hasBiometricCheckin: dto.hasBiometricCheckin ?? false,
        hasSmsAlerts: dto.hasSmsAlerts ?? false,
        hasEmailAlerts: dto.hasEmailAlerts ?? true,
        hasMultiBranch: dto.hasMultiBranch ?? false,
        maxSites: dto.maxSites ?? null,
        maxGuardsDeployed: dto.maxGuardsDeployed ?? null,
        maxCameras: dto.maxCameras ?? null,
        maxStaffUsers: dto.maxStaffUsers ?? null,
        storageRetentionDays: dto.storageRetentionDays ?? 30,
      },
    });
  }

  // ─── GET ALL ───────────────────────────────────────────────

  async findAll() {
    return this.prisma.platformPlan.findMany({
      where: { active: true },
      orderBy: { monthlyPrice: 'asc' },
      include: {
        _count: {
          select: { companySubscriptions: true },
        },
      },
    });
  }

  // ─── GET ONE ───────────────────────────────────────────────

  async findOne(id: string) {
    const plan = await this.prisma.platformPlan.findUnique({
      where: { id },
      include: {
        _count: {
          select: { companySubscriptions: true },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(['Platform plan not found']);
    }

    return plan;
  }

  // ─── UPDATE ────────────────────────────────────────────────

  async update(id: string, dto: UpdatePlatformPlanDto) {
  const existing = await this.findOne(id);

    if (dto.name && dto.name !== existing.name) {
      const duplicate = await this.prisma.platformPlan.findUnique({
      where: { name: dto.name },
        });
      if (duplicate) {
        throw new ConflictException([
          `A plan named "${dto.name}" already exists`,
        ]);
      }
    }

    if (dto.monthlyPrice === undefined && dto.quarterlyPrice === undefined && dto.annualPrice === undefined) {
      throw new ConflictException([
        'At least one billing cycle price must be provided',
      ]);
   }

    return this.prisma.platformPlan.update({
      where: { id },
      data: { ...dto },
    });
  }


  // ─── SOFT DELETE ───────────────────────────────────────────

  async remove(id: string) {
    const plan = await this.findOne(id);

    // Check if any active companies are on this plan
    const activeSubscriptions = await this.prisma.companySubscription.count({
      where: {
        planId: id,
        status: { in: ['TRIALING', 'ACTIVE', 'PAST_DUE'] },
      },
    });

    if (activeSubscriptions > 0) {
      throw new ConflictException([
        `Cannot deactivate plan — ${activeSubscriptions} company(s) are currently on this plan`,
      ]);
    }

    return this.prisma.platformPlan.update({
      where: { id },
      data: { active: false },
    });
  }
}