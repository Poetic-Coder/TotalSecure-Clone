import {
  Inject,
  Injectable,
  UnauthorizedException,
  CACHE_MANAGER,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { randomBytes, createHash } from 'crypto';
import {
  ActiveStatus,
  ClientStatus,
  CompanyStatus,
  GuardStatus,
} from '@prisma/client';
import { PrismaService } from '@database/prisma.service';
import { SecurityService } from '@modules/security/security.service';
import { TokenType } from '@modules/security/security.interface';
import { PermissionResolverService } from '@api/company/rbac/services/permission-resolver.service';
import { AccountType } from '@common/enums';
import {
  AuthenticatedRequestUser,
  TokenAccount,
} from '@common/interfaces';
import {
  JWT_ACCESS_EXPIRES_IN,
  JWT_MFA_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN_DAYS,
} from '@common/constants';
import ExcludeProperty from '@common/utils/exclude-property';

export type SessionResponse = {
  token: string;
  refreshToken: string;
  expiresIn: string;
  userAccount: Record<string, unknown>;
};

/** Access tokens last 30m; blacklist matches that window after revoke. */
const ACCESS_REVOKE_TTL_MS = 30 * 60 * 1000;

@Injectable()
export class AuthSessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly securityService: SecurityService,
    private readonly permissionResolver: PermissionResolverService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async issueSession(
    account: TokenAccount,
    userAccount: Record<string, unknown>,
  ): Promise<SessionResponse> {
    const token = await this.securityService.generateToken({
      data: {
        tokenType: TokenType.ACCESS,
        account: this.toAccessAccount(account),
      },
      expiresIn: JWT_ACCESS_EXPIRES_IN,
    });

    const refreshToken = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + JWT_REFRESH_EXPIRES_IN_DAYS);

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: this.hashToken(refreshToken),
        accountType: account.accountType,
        accountId: account.id,
        expiresAt,
        impersonatedBy: account.impersonatedBy,
      },
    });

    return {
      token,
      refreshToken,
      expiresIn: JWT_ACCESS_EXPIRES_IN,
      userAccount: {
        ...userAccount,
        accountType: account.accountType,
        companyId: account.companyId,
        clientId: account.clientId,
        impersonatedBy: account.impersonatedBy,
      },
    };
  }

  async issueMfaChallenge(account: TokenAccount) {
    const mfaToken = await this.securityService.generateToken({
      data: {
        tokenType: TokenType.MFA_CHALLENGE,
        account: this.toAccessAccount(account),
      },
      expiresIn: JWT_MFA_EXPIRES_IN,
    });

    return {
      mfaRequired: true as const,
      mfaToken,
      accountType: account.accountType,
    };
  }

  async verifyMfaToken(mfaToken: string): Promise<TokenAccount> {
    const payload = await this.securityService.verifyToken(
      mfaToken,
      TokenType.MFA_CHALLENGE,
    );
    if (!payload.account?.id || !payload.account.accountType) {
      throw new UnauthorizedException('Invalid MFA token');
    }
    return payload.account;
  }

  async refresh(refreshToken: string): Promise<SessionResponse> {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: this.hashToken(refreshToken) },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.prisma.refreshToken.update({
      where: { pk: stored.pk },
      data: { revokedAt: new Date() },
    });

    const hydrated = await this.hydrateAccount(
      stored.accountType as AccountType,
      stored.accountId,
      stored.impersonatedBy ?? undefined,
    );

    return this.issueSession(hydrated.account, hydrated.userAccount);
  }

  async logout(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: this.hashToken(refreshToken) },
    });
    if (stored && !stored.revokedAt) {
      await this.prisma.refreshToken.update({
        where: { pk: stored.pk },
        data: { revokedAt: new Date() },
      });
    }
    return { message: 'Logged out' };
  }

  async revokeAllSessions(accountType: AccountType, accountId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { accountType, accountId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    // Kill remaining access-token lifetime even before JWT expiry.
    await this.cache.set(
      this.accessRevokeKey(accountType, accountId),
      true,
      ACCESS_REVOKE_TTL_MS,
    );
  }

  async hydrateFromToken(account: TokenAccount): Promise<AuthenticatedRequestUser> {
    if (await this.cache.get(this.accessRevokeKey(account.accountType, account.id))) {
      throw new UnauthorizedException('Session has been revoked. Please log in again.');
    }

    const hydrated = await this.hydrateAccount(
      account.accountType,
      account.id,
      account.impersonatedBy,
    );
    return {
      ...(this.stripSecret(hydrated.entity) as AuthenticatedRequestUser),
      accountType: account.accountType,
      permissions: hydrated.account.permissions ?? [],
      companyId: hydrated.account.companyId,
      clientId: hydrated.account.clientId,
      impersonatedBy: account.impersonatedBy,
    };
  }

  async hydrateAccount(
    accountType: AccountType,
    accountId: string,
    impersonatedBy?: string,
  ): Promise<{
    account: TokenAccount;
    userAccount: Record<string, unknown>;
    entity: Record<string, unknown>;
  }> {
    switch (accountType) {
      case AccountType.PLATFORM_STAFF: {
        const staff = await this.prisma.platformStaff.findUnique({
          where: { id: accountId },
        });
        if (!staff) throw new UnauthorizedException('Account no longer exists');
        if (staff.active !== ActiveStatus.ACTIVE) {
          throw new UnauthorizedException('Platform account is not active');
        }
        const account: TokenAccount = {
          id: staff.id,
          email: staff.email,
          accountType,
          role: staff.role,
          impersonatedBy,
        };
        return {
          account,
          entity: staff,
          userAccount: this.stripSecret(staff),
        };
      }
      case AccountType.COMPANY: {
        const company = await this.prisma.company.findUnique({
          where: { id: accountId },
        });
        if (!company) throw new UnauthorizedException('Account no longer exists');
        if (company.status !== CompanyStatus.ACTIVE) {
          throw new UnauthorizedException(
            `Company account is ${company.status.toLowerCase()}`,
          );
        }
        const account: TokenAccount = {
          id: company.id,
          email: company.email,
          accountType,
          companyId: company.id,
          impersonatedBy,
        };
        return {
          account,
          entity: company,
          userAccount: this.stripSecret(company),
        };
      }
      case AccountType.STAFF: {
        const staff = await this.prisma.staff.findUnique({
          where: { id: accountId },
          include: { profile: true, company: true },
        });
        if (!staff) throw new UnauthorizedException('Account no longer exists');
        if (staff.active !== ActiveStatus.ACTIVE) {
          throw new UnauthorizedException('Staff account is not active');
        }
        if (staff.company.status !== CompanyStatus.ACTIVE) {
          throw new UnauthorizedException('Company account is not active');
        }
        const resolved = await this.permissionResolver.resolveForStaff(staff.id);
        const account: TokenAccount = {
          id: staff.id,
          email: staff.email,
          accountType,
          role: staff.role,
          companyId: staff.companyId,
          permissions: resolved.effective,
          impersonatedBy,
        };
        return {
          account,
          entity: staff,
          userAccount: {
            ...this.stripSecret(staff),
            permissions: resolved.effective,
          },
        };
      }
      case AccountType.GUARD: {
        const guard = await this.prisma.guard.findUnique({
          where: { id: accountId },
          include: { profile: true, company: true },
        });
        if (!guard) throw new UnauthorizedException('Account no longer exists');
        if (
          guard.status === GuardStatus.SUSPENDED ||
          guard.status === GuardStatus.RETIRED
        ) {
          throw new UnauthorizedException(
            `Guard account is ${guard.status.toLowerCase()}`,
          );
        }
        if (guard.company.status !== CompanyStatus.ACTIVE) {
          throw new UnauthorizedException('Company account is not active');
        }
        const account: TokenAccount = {
          id: guard.id,
          email: guard.email,
          accountType,
          companyId: guard.companyId,
          guardStatus: guard.status,
          impersonatedBy,
        };
        return {
          account,
          entity: guard,
          userAccount: this.stripSecret(guard),
        };
      }
      case AccountType.CLIENT: {
        const client = await this.prisma.client.findUnique({
          where: { id: accountId },
          include: { company: true },
        });
        if (!client) throw new UnauthorizedException('Account no longer exists');
        if (client.status !== ClientStatus.ACTIVE) {
          throw new UnauthorizedException(
            `Client account is ${client.status.toLowerCase()}`,
          );
        }
        if (client.company.status !== CompanyStatus.ACTIVE) {
          throw new UnauthorizedException('Company account is not active');
        }
        const account: TokenAccount = {
          id: client.id,
          email: client.email,
          accountType,
          companyId: client.companyId,
          clientId: client.id,
          clientType: client.clientType,
          impersonatedBy,
        };
        return {
          account,
          entity: client,
          userAccount: this.stripSecret(client),
        };
      }
      case AccountType.CLIENT_STAFF: {
        const clientStaff = await this.prisma.clientStaff.findUnique({
          where: { id: accountId },
          include: { profile: true, client: { include: { company: true } } },
        });
        if (!clientStaff) {
          throw new UnauthorizedException('Account no longer exists');
        }
        if (clientStaff.active !== ActiveStatus.ACTIVE) {
          throw new UnauthorizedException('Client staff account is not active');
        }
        if (clientStaff.client.status !== ClientStatus.ACTIVE) {
          throw new UnauthorizedException('Client account is not active');
        }
        if (clientStaff.client.company.status !== CompanyStatus.ACTIVE) {
          throw new UnauthorizedException('Company account is not active');
        }
        const account: TokenAccount = {
          id: clientStaff.id,
          email: clientStaff.email,
          accountType,
          companyId: clientStaff.client.companyId,
          clientId: clientStaff.clientId,
          clientRole: clientStaff.role,
          impersonatedBy,
        };
        return {
          account,
          entity: clientStaff,
          userAccount: this.stripSecret(clientStaff),
        };
      }
      default:
        throw new UnauthorizedException('Invalid account type');
    }
  }

  stripSecret<T extends Record<string, unknown>>(entity: T) {
    return ExcludeProperty(entity, ['password'] as (keyof T)[]);
  }

  private toAccessAccount(account: TokenAccount): TokenAccount {
    return {
      id: account.id,
      email: account.email,
      accountType: account.accountType,
      companyId: account.companyId,
      clientId: account.clientId,
      impersonatedBy: account.impersonatedBy,
    };
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private accessRevokeKey(accountType: AccountType, accountId: string) {
    return `access_revoked_${accountType}_${accountId}`;
  }
}
