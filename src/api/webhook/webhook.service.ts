import { EventService } from '@api/events/services/events.service';
import { FirebaseFcmService } from '@modules/firebase/firebase-fcm.service';
import { PrismaService } from '@database/prisma.service';
import { BadRequestException, Inject, Injectable, Logger, NotFoundException, forwardRef } from '@nestjs/common';
import {
  Prisma,
  TransactionType,
  VerificationStatus,
} from '@prisma/client';
import { EventType } from '@api/events/types';
import { EmailService } from '@modules/network/services/email/email.service';
import { KycService } from '@api/kyc/kyc.service';
import { NotificationService } from '@api/notification/notification.service';
import { SmsService } from '@modules/network/services/sms/sms.service';
import { AddressVerificationCompletedEvent, OkHiAddressCollectedEvent, OkHiEvent } from './type';
import { AgentApprovalDto } from './dtos/index.dto';
import { AgentRepository } from '@api/user/repositories/agent.repository';
import { AgentProfileRepository } from '@api/user/repositories/agent-profile.repository';


@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  constructor(
    private readonly firebaseService: FirebaseFcmService,
    private readonly prismaService: PrismaService,
    private readonly eventService: EventService,
    private readonly emailService: EmailService,
    private readonly kycService: KycService,
    private readonly smsService: SmsService,
    private readonly notificationService: NotificationService,
    private readonly agentRepo: AgentRepository,
    private readonly agentProfileRepo: AgentProfileRepository,
  ) { }

  async processAgentApproval(payload: any) {
    const { bankAccountNumber, accountName, status, phone } = payload;

    const agent = await this.agentRepo.find({ where: { phone } })

    if (!agent) {
      throw new BadRequestException('Agent not found in our records')
    }

    await this.prismaService.bankAccount.create({
      data: {
        accountName: payload.accountName,
        accountNumber: payload.bankAccountNumber,
        agent: {
          connect: {
            id: agent.id
          }
        }
      },
    })
    // update kyc status to approved
   await this.agentProfileRepo.updateAgentKyc({
      where: {
        agentPk_agentId: {
          agentId: agent.id,
          agentPk: agent.pk,
        },
      },
      data: {
        status: 'APPROVED'
      },
    });

    return {
      message: 'agent account approved successfully'
    }
  }

}
