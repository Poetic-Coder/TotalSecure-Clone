import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { Prisma, GuardProfile } from '@prisma/client';

@Injectable()
export class GuardProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async create(query: Prisma.GuardProfileCreateArgs){
    return this.prisma.guardProfile.create(query);
  }

  public async find(query: Prisma.GuardProfileFindFirstArgs) {
    return this.prisma.guardProfile.findFirst(query);
  }

  public async findById(id: string) {
    return this.prisma.guardProfile.findFirst({ where: { id } });
  }

  public async findByGuardId(guardId: string): Promise<GuardProfile | null> {
    return this.prisma.guardProfile.findFirst({ where: { guardId } });
  }

  public async findMany(query: Prisma.GuardProfileFindManyArgs) {
    return this.prisma.guardProfile.findMany(query);
  }

  public async update(query: Prisma.GuardProfileUpdateArgs) {
    return this.prisma.guardProfile.update(query);
  }

}