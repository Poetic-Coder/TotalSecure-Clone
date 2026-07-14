import { EventService } from '@api/events/services/events.service';
import { FirebaseFcmService } from '@modules/firebase/firebase-fcm.service';
import { PrismaService } from '@database/prisma.service';
import { BadRequestException, Inject, Injectable, Logger, NotFoundException, forwardRef } from '@nestjs/common';
import {
  Prisma,
  VerificationStatus,
} from '@prisma/client';
import { EventType } from '@api/events/types';
import { EmailService } from '@modules/network/services/email/email.service';
import { KycService } from '@api/kyc/kyc.service';
import { NotificationService } from '@api/notification/notification.service';
import { SmsService } from '@modules/network/services/sms/sms.service';


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
  ) { }


}
