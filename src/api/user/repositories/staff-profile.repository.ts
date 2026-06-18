import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { Prisma, StaffProfile } from '@prisma/client';

@Injectable()
export class StaffProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async create(query: Prisma.StaffProfileCreateArgs){
    return this.prisma.staffProfile.create(query);
  }

  public async find(query: Prisma.StaffProfileFindFirstArgs) {
    return this.prisma.staffProfile.findFirst(query);
  }

  public async findById(id: string) {
    return this.prisma.staffProfile.findFirst({ where: { id } });
  }

  public async findByStaffId(staffId: string): Promise<StaffProfile | null> {
    return this.prisma.staffProfile.findFirst({ where: { staffId } });
  }

  public async findMany(query: Prisma.StaffProfileFindManyArgs) {
    return this.prisma.staffProfile.findMany(query);
  }

  public async update(query: Prisma.StaffProfileUpdateArgs) {
    return this.prisma.staffProfile.update(query);
  }

}