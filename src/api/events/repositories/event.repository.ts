import { AbstractRepository } from '@common/interfaces/repo';
import { PrismaService } from '@database/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

/*
@Injectable()
export class EventRepository extends AbstractRepository<
  Prisma.WebhookEventCreateArgs,
  Prisma.WebhookEventFindFirstArgs,
  Prisma.WebhookEventFindManyArgs,
  Prisma.WebhookEventUpdateArgs,
  Prisma.WebhookEventDeleteArgs,
  Prisma.WebhookEventUpdateManyArgs,
  Prisma.WebhookEventFindUniqueArgs,
  WebhookEvent
>{
  M = 'webhookEvent';

  constructor(
    readonly prisma: PrismaService
  ) {
    super(prisma);
  }
}
*/