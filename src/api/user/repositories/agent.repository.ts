import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { Prisma, Agent } from '@prisma/client';


export type AgentWithProfile = Prisma.AgentGetPayload<{
  include: {
    profile: true;
  };
}>;

@Injectable()
export class AgentRepository {
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

  public async create(query: Prisma.AgentCreateArgs): Promise<AgentWithProfile> {
    return this.prismaService.agent.create(this.includeProfile(query)) as any;
  }

  public async find(query: Prisma.AgentFindFirstArgs, profile = true): Promise<AgentWithProfile | Agent> {
    if (profile) {
      return this.prismaService.agent
        .findFirst(this.includeProfile(query)) as any;
    }
    return this.prismaService.agent
      .findFirst(query);
  }

  public async findMany(params: Prisma.AgentFindManyArgs): Promise<AgentWithProfile[]> {
    return this.prismaService.agent.findMany(this.includeProfile(params)) as any;
  }

  public async count(params: Prisma.AgentCountArgs): Promise<number> {
    return this.prismaService.agent.count(params);
  }

  public async findById(id: string): Promise<AgentWithProfile | null> {
    return this.prismaService.agent.findUnique({
      where: { id },
      include: { profile: true },
    }) as any;
  }

  public async findByEmail(email: string): Promise<AgentWithProfile | null> {
    return this.prismaService.agent.findUnique({
      where: { email },
      include: { profile: true },
    }) as any;
  }

  public async update(params: Prisma.AgentUpdateArgs): Promise<AgentWithProfile> {
    return this.prismaService.agent.update(this.includeProfile(params)) as any;
  }

  public async delete(params: Prisma.AgentDeleteArgs): Promise<Agent> {
    return this.prismaService.agent.delete(params);
  }

  public async findAgent(params: Prisma.AgentFindFirstArgs) {
    return this.prismaService.agent.findFirst(params)
  }
}