import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class StaffProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async find(query: Prisma.StaffProfileFindFirstArgs) {
    return this.prisma.staffProfile.findFirst(query);
  }

  public async update(query: Prisma.StaffProfileUpdateArgs) {
    return this.prisma.staffProfile.update(query);
  }
}
