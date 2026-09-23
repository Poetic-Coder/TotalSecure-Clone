import { Injectable } from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';
import { PrismaService } from '@database/prisma.service';
import { AuthenticatedRequestUser } from '@common/interfaces';

export type AuditLogInput = {
  action: AuditAction;
  module: string;
  description?: string;
  targetId?: string;
  targetType?: string;
  metadata?: Prisma.InputJsonValue;
  companyPk?: number | null;
  companyId?: string | null;
  staffPk?: number | null;
  staffId?: string | null;
};

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async log(input: AuditLogInput) {
    return this.prisma.auditLog.create({
      data: {
        action: input.action,
        module: input.module,
        description: input.description,
        targetId: input.targetId,
        targetType: input.targetType,
        metadata: input.metadata,
        companyPk: input.companyPk ?? undefined,
        companyId: input.companyId ?? undefined,
        staffPk: input.staffPk ?? undefined,
        staffId: input.staffId ?? undefined,
      },
    });
  }

  /** Annotate metadata with impersonatedBy when the actor is impersonating. */
  async logForActor(actor: AuthenticatedRequestUser | null | undefined, input: AuditLogInput) {
    const metadata =
      actor?.impersonatedBy != null
        ? {
            ...(typeof input.metadata === 'object' &&
            input.metadata !== null &&
            !Array.isArray(input.metadata)
              ? (input.metadata as Record<string, unknown>)
              : {}),
            impersonatedBy: actor.impersonatedBy,
            actorAccountType: actor.accountType,
            actorId: actor.id,
          }
        : input.metadata;

    return this.log({ ...input, metadata: metadata as Prisma.InputJsonValue });
  }
}
