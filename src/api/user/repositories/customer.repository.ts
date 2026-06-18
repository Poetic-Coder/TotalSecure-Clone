import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { Prisma, Customer } from '@prisma/client';

export type CustomerWithProfile = Prisma.CustomerGetPayload<{
  include: {
    profile: true;
  };
}>;

@Injectable()
export class CustomerRepository {
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

  public async create(query: Prisma.CustomerCreateArgs): Promise<CustomerWithProfile> {
    return this.prismaService.customer.create(this.includeProfile(query)) as any;
  }

  public async find(query: Prisma.CustomerFindFirstArgs, profile = true): Promise<CustomerWithProfile | Customer> {
    if (profile) {
      return this.prismaService.customer
        .findFirst(this.includeProfile(query)) as any;
    }
    return this.prismaService.customer
      .findFirst(query);
  }

  public async findMany(params: Prisma.CustomerFindManyArgs): Promise<CustomerWithProfile[]> {
    return this.prismaService.customer.findMany(this.includeProfile(params)) as any;
  }

  public async findById(id: string): Promise<CustomerWithProfile | null> { 
    return this.prismaService.customer.findUnique({
      where: { id },
      include: { profile: true },
    }) as any;
  }

  public async findByEmail(email: string): Promise<CustomerWithProfile | null> {
    return this.prismaService.customer.findUnique({
      where: { email },
      include: { profile: true },
    }) as any;
  }

  public async update(params: Prisma.CustomerUpdateArgs): Promise<CustomerWithProfile> {
    return this.prismaService.customer.update(this.includeProfile(params)) as any;
  }

  public async delete(params: Prisma.CustomerDeleteArgs): Promise<Customer> {
    return this.prismaService.customer.delete(params);
  }
}