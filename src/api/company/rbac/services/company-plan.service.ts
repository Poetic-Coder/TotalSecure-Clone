import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';

@Injectable()
export class CompanyPlanService {
  constructor(private readonly prisma: PrismaService) {}

  async assertCanUseCustomRoles(companyId: string) {
    const sub = await this.prisma.companySubscription.findFirst({
      where: { companyId },
      include: { plan: true },
    });

    if (!sub?.plan?.hasCustomRoles) {
      throw new ForbiddenException(
        'Your platform plan does not include custom roles. Upgrade to enable this feature.',
      );
    }

    return sub.plan;
  }
}
