import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { Prisma, Staff } from '@prisma/client';

export type StaffWithProfile = Prisma.StaffGetPayload<{
  include: {
    profile: true;
  };
}>;

@Injectable()
export class StaffRepository {
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

  public async create(query: Prisma.StaffCreateArgs): Promise<StaffWithProfile> {
    return this.prismaService.staff.create(this.includeProfile(query)) as any;
  }

  public async find(query: Prisma.StaffFindFirstArgs, profile = true): Promise<StaffWithProfile | Staff> {
    if (profile) {
      return this.prismaService.staff
        .findFirst(this.includeProfile(query)) as any;
    }
    return this.prismaService.staff
      .findFirst(query);
  }

  public async findMany(params: Prisma.StaffFindManyArgs): Promise<StaffWithProfile[]> {
    return this.prismaService.staff.findMany(this.includeProfile(params)) as any;
  }

  public async findById(id: string): Promise<StaffWithProfile | null> {
    return this.prismaService.staff.findUnique({
      where: { id },
      include: { profile: true },
    }) as any;
  }

  public async findByEmail(email: string): Promise<StaffWithProfile | null> {
    return this.prismaService.staff.findUnique({
      where: { email },
      include: { profile: true },
    }) as any;
  }

  public async findByEmployeeId(employeeId: string): Promise<StaffWithProfile | null> {
    return this.prismaService.staff.findUnique({
      where: { employeeId },
      include: { profile: true },
    }) as any;
  }

  public async update(params: Prisma.StaffUpdateArgs): Promise<StaffWithProfile> {
    return this.prismaService.staff.update(this.includeProfile(params)) as any;
  }

  public async delete(params: Prisma.StaffDeleteArgs): Promise<Staff> {
    return this.prismaService.staff.delete(params);
  }
}