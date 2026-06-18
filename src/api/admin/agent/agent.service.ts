import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import axios from 'axios';
import { AgentRepository } from '@api/user/repositories/agent.repository';
import { Prisma } from '@prisma/client';
import { MoolaClient } from '@modules/clients/clients/moola/moola';
import { SaudiaAgentDto } from './dto/saudiaAgent.dto';
import { AgentProfileRepository } from '@api/user/repositories/agent-profile.repository';
import { string } from 'yargs';

@Injectable()
export class AgentService {
     private readonly logger = new Logger(AgentService.name);

    constructor(private readonly prisma: PrismaService,
        private readonly agentRepo: AgentRepository,
        private readonly moolaClient: MoolaClient,
        private readonly agentProfileRepo: AgentProfileRepository) { }

    public async sendAgentToBank(agentId: string) {
        const agent = await this.agentRepo.findAgent({
            where: {
                id: agentId
            },
            include: {
                profile: true,
                kyc: true
            }
        }) as Prisma.AgentGetPayload<{ include: { profile: true, kyc: true } }>

        if (!agent) {
            throw new BadRequestException('Agent not found');
        }

        const registerAccessToken = await this.moolaClient.handshake(agent.phone)

        const mappedPayload: SaudiaAgentDto = {
            email: agent.email,
            phone: agent.phone,
            firstName: agent.profile?.firstName,
            lastName: agent.profile?.lastName,
            dob: agent.profile.dob.toISOString(),
            gender: agent.profile?.gender,
            photo: agent.profile?.photo,
            bvn: agent.kyc?.bvn,
            id_type: agent.kyc?.idType,
            id_number: agent.kyc?.idNumber,
            idImageUrl: agent.kyc?.idImageUrl,
            cacImageUrl: agent.kyc?.cacImageUrl,
            cacNumber: agent.kyc?.cacNumber,
            name: agent.kyc?.name,
            description: agent.kyc?.description,
            employees: agent.kyc?.employees,
            registerAccessToken,
            agentAddress: {
                address: agent.profile?.homeAddress,
                city: agent.profile?.city,
                state: agent.profile?.state,
                country: agent.profile.country,
                lga: agent.profile?.lga,
            },
            businessAddress: {
                address: agent.kyc?.address,
                city: agent.kyc?.city,
                state: agent.kyc?.state,
                country: agent.kyc?.country,
                lga: agent.kyc?.lga,
            },
        };

        const response = await this.moolaClient.sendSaudiaAgent(mappedPayload)

        if (!response.success) {
            this.logger.error(response);
            throw new BadRequestException('Error contacting Daven Port Banking services');
        }

        return {
            message: "agent successfully sent to bank for approval"
        }
    }


    public async getAllAgents(params: {
        status?: string;
        page?: number | string;
        limit?: number | string;
    }) {
        const pageNum = Math.max(1, parseInt(params.page as string) || 1);
        const limitNum = Math.max(1, parseInt(params.limit as string) || 10);

        const where: Prisma.AgentWhereInput = {};
        if (params.status) {
            where.kyc = {
                status: params.status as any, 
            };
        }

        const skip = (pageNum - 1) * limitNum;

        const [agents, total] = await Promise.all([
            this.agentRepo.findMany({
                where,
                include: {
                    profile: true,
                    kyc: {
                        select: {
                            address: true,
                            bvn: true,
                            cacNumber: true,
                            city: true,
                            country: true,
                            idNumber: true,
                            idType: true,
                            description: true,
                            name: true, logo: true,
                            lga: true, state: true,
                            status: true,
                        }
                    },
                    bankAccount: true,
                },
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
            }) as Promise<Prisma.AgentGetPayload<{
                include: {
                    profile: true;
                    kyc: {
                        select: {
                            address: true,
                            bvn: true,
                            cacNumber: true,
                            city: true,
                            country: true,
                            idNumber: true,
                            idType: true,
                            description: true,
                            name: true, logo: true,
                            lga: true, state: true,
                            status: true,
                        }
                    };
                    bankAccount: true;
                };
            }>[]>,

            this.agentRepo.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limitNum);

        return {
            success: true,
            data: {
                agents,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages,
                },
            },
        };
    }


    public async getAgentById(agentId: string) {
        const agent = await this.agentRepo.findAgent({
            where: { id: agentId },
            include: {
                profile: true,
                kyc: {
                    select: {
                        address: true,
                        bvn: true,
                        cacNumber: true,
                        city: true,
                        country: true,
                        idNumber: true,
                        idType: true,
                        description: true,
                        name: true, logo: true,
                        lga: true, state: true,
                        status: true,
                    }
                },
                bankAccount: true,
            },
        });

        if (!agent) {
            throw new NotFoundException(`Agent with id ${agentId} not found`);
        }

        return {
            success: true,
            data: agent,
        };
    }

    


}



