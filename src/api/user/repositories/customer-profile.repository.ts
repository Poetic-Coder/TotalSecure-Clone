import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { Prisma, CustomerProfile } from '@prisma/client';

@Injectable()
export class CustomerProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async create(query: Prisma.CustomerProfileCreateArgs){
    return this.prisma.customerProfile.create(query);
  }

  public async find(query: Prisma.CustomerProfileFindFirstArgs) {   
    return this.prisma.customerProfile.findFirst(query);
  }

  public async findById(id: string) {
    return this.prisma.customerProfile.findFirst({ where: { id } });
  }

  public async findByCustomerId(customerId: string): Promise<CustomerProfile | null> {
    return this.prisma.customerProfile.findFirst({ where: { customerId } });
  }

  public async findMany(query: Prisma.CustomerProfileFindManyArgs) {
    return this.prisma.customerProfile.findMany(query);
  }

  public async update(query: Prisma.CustomerProfileUpdateArgs) {
    return this.prisma.customerProfile.update(query);
  }

}