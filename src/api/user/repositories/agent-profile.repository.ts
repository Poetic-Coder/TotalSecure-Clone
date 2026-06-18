import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { Prisma, AgentProfile } from '@prisma/client';

@Injectable()
export class AgentProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async create(query: Prisma.AgentProfileCreateArgs){
    return this.prisma.agentProfile.create(query);
  }

  public async find(query: Prisma.AgentProfileFindFirstArgs) {
    return this.prisma.agentProfile.findFirst(query);
  }

  public async findById(id: string) {
    return this.prisma.agentProfile.findFirst({ where: { id } });
  }

  public async findByAgentId(agentId: string): Promise<AgentProfile | null> {
    return this.prisma.agentProfile.findFirst({ where: { agentId } });
  }

  public async findMany(query: Prisma.AgentProfileFindManyArgs) {
    return this.prisma.agentProfile.findMany(query);
  }

  public async update(query: Prisma.AgentProfileUpdateArgs) {
    return this.prisma.agentProfile.update(query);
  }

  async updateAgentKyc(query: Prisma.AgentKycUpdateArgs){
    return this.prisma.agentKyc.update(query)
  }
  async findAgentKyc(query: Prisma.AgentKycFindFirstArgs) {
    return this.prisma.agentKyc.findFirst(query)
  }

  
}