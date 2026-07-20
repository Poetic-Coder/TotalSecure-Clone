import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { Prisma, Guard } from '@prisma/client';

export type GuardWithProfile = Prisma.GuardGetPayload<{
  include: {
    profile: true;
  };
}>;

@Injectable()
export class GuardRepository {
  constructor(private readonly prismaService: PrismaService) {}

  private includeProfile(query: any) {
    if (!query.include) {
      query.include = { profile: true };
    }

    if (!query.include.profile) {
      query.include.profile = true;
    }

    return query;
  }

  public async create(query: Prisma.GuardCreateArgs): Promise<GuardWithProfile> {
    return this.prismaService.guard.create(this.includeProfile(query)) as any;
  }

  public async find(query: Prisma.GuardFindFirstArgs, profile = true): Promise<GuardWithProfile | Guard> {
    if (profile) {
      return this.prismaService.guard
        .findFirst(this.includeProfile(query)) as any;
    }
    return this.prismaService.guard
      .findFirst(query);
  }

  public async findMany(params: Prisma.GuardFindManyArgs): Promise<GuardWithProfile[]> {
    return this.prismaService.guard.findMany(this.includeProfile(params)) as any;
  }

  public async findById(id: string): Promise<GuardWithProfile | null> {
    return this.prismaService.guard.findUnique({
      where: { id },
      include: { profile: true },
    }) as any;
  }

  public async findByEmail(email: string): Promise<GuardWithProfile | null> {
    return this.prismaService.guard.findUnique({
      where: { email },
      include: { profile: true },
    }) as any;
  }

  public async findByEmployeeId(employeeId: string): Promise<GuardWithProfile | null> {
    return this.prismaService.guard.findUnique({
      where: { employeeId },
      include: { profile: true },
    }) as any;
  }

  public async update(params: Prisma.GuardUpdateArgs): Promise<GuardWithProfile> {
    return this.prismaService.guard.update(this.includeProfile(params)) as any;
  }

  public async delete(params: Prisma.GuardDeleteArgs): Promise<Guard> {
    return this.prismaService.guard.delete(params);
  }
}