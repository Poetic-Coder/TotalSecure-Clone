import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { AccountType } from '@common/enums';
import { AnyUser } from '@common/interfaces';
import { randomBytes } from 'crypto';
import { addDays, isAfter } from 'date-fns';

export interface ValidatedApiKey {
  user: AnyUser;
  accountType: AccountType;
}

@Injectable()
export class ApiKeyService {
  constructor(private prisma: PrismaService) {}

  async createKey(
    ownerType: 'staff' | 'guard' | 'client',
    ownerId: string,
    description: string,
    options?: { expiresInDays?: number; rateLimit?: number },
  ): Promise<{ key: string; apiKey: any }> {
    const plainKey = `tsnl_${randomBytes(32).toString('hex')}`;
    const data = {
      key: plainKey,
      description,
      active: true,
      expiresAt: options?.expiresInDays ? addDays(new Date(), options.expiresInDays) : null,
      rateLimit: options?.rateLimit ?? 1000,
      resetAt: new Date(),
      requestCount: 0,
    };

    const apiKey = await this.prisma.apiKey.create({
      data: {
        ...data,
        [ownerType]: { connect: { id: ownerId } },
      },
    });
    return { key: plainKey, apiKey };
  }

  async validateKey(key: string): Promise<ValidatedApiKey | null> {
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { key },
      include: { staff: true, guard: true, client: true },
    });

    if (!apiKey) return null;

    // Active & expiry
    if (!apiKey.active) return null;
    if (apiKey.expiresAt && isAfter(new Date(), apiKey.expiresAt)) return null;

    const now = new Date();
    const windowSeconds = 3600;
    if (apiKey.resetAt && now > apiKey.resetAt) {
      await this.prisma.apiKey.update({
        where: { key },
        data: { requestCount: 1, resetAt: new Date(now.getTime() + windowSeconds * 1000) },
      });
    } else {
      if (apiKey.requestCount >= apiKey.rateLimit) return null;
      await this.prisma.apiKey.update({
        where: { key },
        data: { requestCount: { increment: 1 } },
      });
    }

    await this.prisma.apiKey.update({
      where: { key },
      data: { lastUsed: new Date() },
    });

    let user: AnyUser | null = null;
    let accountType: AccountType | null = null;
    if (apiKey.staff && apiKey.staff.role === 'SUPER_ADMIN') {user = apiKey.staff; accountType = AccountType.ADMIN}
    else if (apiKey.staff) { user = apiKey.staff; accountType = AccountType.STAFF; }
    else if (apiKey.guard) { user = apiKey.guard; accountType = AccountType.GUARD; }
    else if (apiKey.client) { user = apiKey.client; accountType = AccountType.CLIENT; }

    return user ? { user, accountType } : null;
  }

  async revokeKey(key: string): Promise<void> {
    await this.prisma.apiKey.update({ where: { key }, data: { active: false } });
  }

  async rotateKey(oldKey: string, options?: { expiresInDays?: number }): Promise<{ newKey: string }> {
    const existing = await this.prisma.apiKey.findUnique({ where: { key: oldKey } });
    if (!existing) throw new Error('Key not found');
    let ownerType: 'staff' | 'guard' | 'client' | null = null;
    let ownerId: string | null = null;
    if (existing.staffId) { ownerType = 'staff'; ownerId = existing.staffId; }
    else if (existing.guardId) { ownerType = 'guard'; ownerId = existing.guardId; }
    else if (existing.clientId) { ownerType = 'client'; ownerId = existing.clientId; }
    if (!ownerType || !ownerId) throw new Error('Orphaned key');

    await this.revokeKey(oldKey);
    const { key: newPlainKey } = await this.createKey(
      ownerType,
      ownerId,
      existing.description || 'Rotated key',
      { expiresInDays: options?.expiresInDays },
    );
    return { newKey: newPlainKey };
  }
}