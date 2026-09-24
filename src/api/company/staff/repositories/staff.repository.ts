import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { Prisma } from '@prisma/client';

export type StaffWithProfile = Prisma.StaffGetPayload<{
  include: {
    profile: true;
  };
}>;

@Injectable()
export class StaffRepository {
  constructor(private readonly prismaService: PrismaService) {}

  public async update(
    params: Prisma.StaffUpdateArgs,
  ): Promise<StaffWithProfile> {
    return this.prismaService.staff.update({
      ...params,
      include: { ...(params.include ?? {}), profile: true },
    }) as any;
  }
}
