import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  CACHE_MANAGER,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import {
  ActiveStatus,
  AuditAction,
  ClientStatus,
  ClientType,
  CompanyStatus,
  OnboardingMethod,
  PlatformStaff,
  PlatformStaffRole,
} from '@prisma/client';
import { PrismaService } from '@database/prisma.service';
import { HashingService } from '@modules/hashing/hashing.service';
import { EmailService } from '@modules/network/services/email/email.service';
import { AuditLogService } from '@api/company/rbac/services/audit-log.service';
import { AccountType } from '@common/enums';
import { AuthenticatedRequestUser, TokenAccount } from '@common/interfaces';
import { OTP_EXPIRY } from '@common/constants';
import { generateOtp } from '@common/utils/otp';
import { validatePassword } from '@common/utils/password';
import { cleanPhone } from '@common/utils/phone';
import { AuthSessionService } from './auth-session.service';
import {
  AssignCompanyDto,
  CreateCompanyClientDto,
  CreateCompanyStaffDto,
  CreatePlatformStaffDto,
  RegisterClientDto,
  RegisterCompanyDto,
} from '@api/common/auth/dtos/unified-auth.dto';

@Injectable()
export class AuthAccountService {
  private readonly MAX_ATTEMPTS = 3;
  private readonly BLOCK_TIME_MS = 2 * 60 * 1000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly hashingService: HashingService,
    private readonly session: AuthSessionService,
    private readonly emailService: EmailService,
    private readonly auditLog: AuditLogService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  /**
   * Company portal login — Company account or company Staff only.
   */
  async loginCompanyPortal(email: string, password: string) {
    const normalized = email.toLowerCase();
    const attemptsKey = `login_attempts_COMPANY_PORTAL_${normalized}`;
    const blockedKey = `login_blocked_COMPANY_PORTAL_${normalized}`;
    await this.checkLoginBlock(blockedKey);

    const [company, staff] = await Promise.all([
      this.prisma.company.findUnique({
        where: { email: normalized },
        select: { id: true },
      }),
      this.prisma.staff.findUnique({
        where: { email: normalized },
        select: { id: true },
      }),
    ]);

    if (company) {
      return this.loginByType(AccountType.COMPANY, email, password);
    }
    if (staff) {
      return this.loginByType(AccountType.STAFF, email, password);
    }

    await this.recordFailedAttempt(attemptsKey, blockedKey);
    throw new BadRequestException(['Invalid email or password']);
  }

  /**
   * Client portal login — Client account only.
   */
  async loginClient(email: string, password: string) {
    return this.loginByType(AccountType.CLIENT, email, password);
  }

  async loginPlatform(email: string, password: string) {
    return this.loginByType(AccountType.PLATFORM_STAFF, email, password);
  }

  async loginGuard(email: string, password: string) {
    return this.loginByType(AccountType.GUARD, email, password);
  }

  async loginClientStaff(email: string, password: string) {
    return this.loginByType(AccountType.CLIENT_STAFF, email, password);
  }

  async verifyMfa(mfaToken: string, otp: string) {
    const account = await this.session.verifyMfaToken(mfaToken);
    const cacheKey = this.mfaKey(account.accountType, account.id);
    const stored = await this.cache.get<string>(cacheKey);
    if (!stored || stored !== otp) {
      throw new BadRequestException(['Invalid or expired MFA code']);
    }
    await this.cache.del(cacheKey);
    const hydrated = await this.session.hydrateAccount(
      account.accountType,
      account.id,
      account.impersonatedBy,
    );
    await this.touchLastLogin(account.accountType, account.id);
    return this.session.issueSession(hydrated.account, hydrated.userAccount);
  }

  async enableMfa(user: AuthenticatedRequestUser, password: string) {
    this.assertNotImpersonating(user, 'MFA');
    await this.assertCurrentPassword(user, password);
    await this.setMfa(user.accountType, user.id, true);
    return {
      message: 'MFA enabled. The next login will require an email code.',
    };
  }

  async disableMfa(user: AuthenticatedRequestUser, password: string) {
    this.assertNotImpersonating(user, 'MFA');
    await this.assertCurrentPassword(user, password);
    await this.setMfa(user.accountType, user.id, false);
    return { message: 'MFA disabled' };
  }

  async registerCompany(dto: RegisterCompanyDto) {
    this.assertPassword(dto.password);
    const domain = this.normalizeDomain(dto.domain);
    await this.assertEmailAvailable(dto.email);
    await this.assertUniqueCompany(dto.email, domain);

    const company = await this.prisma.company.create({
      data: {
        name: dto.name,
        slug: this.generateSlug(dto.name),
        domain,
        email: dto.email.toLowerCase(),
        password: await this.hashingService.hash(dto.password),
        phone: dto.phone,
        brandName: dto.brandName,
        primaryColor: dto.primaryColor,
        supportEmail: dto.supportEmail,
        city: dto.city,
        state: dto.state,
        country: dto.country,
        status: CompanyStatus.PENDING_APPROVAL,
      },
    });

    return {
      message: 'Company registered. Awaiting platform approval.',
      company: this.session.stripSecret(company),
    };
  }

  async registerClient(dto: RegisterClientDto) {
    this.assertPassword(dto.password);
    const domain = this.normalizeDomain(dto.domain);
    const company = await this.prisma.company.findUnique({ where: { domain } });
    if (!company || company.status !== CompanyStatus.ACTIVE) {
      throw new BadRequestException([
        'Company is not available for registration',
      ]);
    }

    const phone = cleanPhone(dto.phone);
    await this.assertEmailAvailable(dto.email);
    await this.assertUniqueClient(dto.email, dto.phone);

    const client = await this.prisma.client.create({
      data: {
        name: dto.name,
        slug: this.generateSlug(dto.name),
        email: dto.email.toLowerCase(),
        phone,
        password: await this.hashingService.hash(dto.password),
        clientType: dto.clientType ?? ClientType.ORGANIZATION,
        status: ClientStatus.PENDING_APPROVAL,
        onboardingMethod: OnboardingMethod.SELF_SIGNUP,
        city: dto.city,
        state: dto.state,
        country: dto.country,
        company: { connect: { id: company.id } },
      },
    });

    return {
      message: 'Client registered. Awaiting company approval.',
      client: this.session.stripSecret(client),
    };
  }

  async getBranding(domain: string) {
    if (!domain) {
      throw new BadRequestException(['domain is required']);
    }
    const company = await this.prisma.company.findUnique({
      where: { domain: this.normalizeDomain(domain) },
      select: {
        name: true,
        domain: true,
        logo: true,
        brandName: true,
        primaryColor: true,
        supportEmail: true,
        status: true,
      },
    });
    if (!company) {
      throw new NotFoundException('Company branding not found');
    }
    return company;
  }

  async forgotPassword(email: string, accountType: AccountType) {
    const generic = {
      message:
        'If this account is registered, you will receive a reset code shortly.',
    };
    const record = await this.findLoginRecord(accountType, email);
    if (!record) return generic;

    const otp = generateOtp();
    await this.cache.set(this.resetKey(accountType, email), otp, OTP_EXPIRY);
    try {
      await this.emailService.sendOtp(email, {
        name: record.name,
        otp,
      });
    } catch (error) {
      console.error('Forgot password email failed:', error);
    }
    return generic;
  }

  async resetPassword(
    email: string,
    accountType: AccountType,
    otp: string,
    password: string,
  ) {
    this.assertPassword(password);
    const key = this.resetKey(accountType, email);
    const stored = await this.cache.get<string>(key);
    if (!stored || stored !== otp) {
      throw new BadRequestException(['Invalid or expired reset code']);
    }

    const record = await this.findLoginRecord(accountType, email);
    if (!record) {
      throw new BadRequestException(['Invalid or expired reset code']);
    }

    await this.updatePassword(accountType, record.id, password);
    await this.session.revokeAllSessions(accountType, record.id);
    await this.cache.del(key);
    return { message: 'Password reset successfully. You can now log in.' };
  }

  async approveCompany(actor: AuthenticatedRequestUser, companyId: string) {
    this.assertPlatformSuperAdmin(actor);
    const company = await this.requireCompany(companyId);
    if (company.status !== CompanyStatus.PENDING_APPROVAL) {
      throw new BadRequestException(['Company is not pending approval']);
    }
    const updated = await this.prisma.company.update({
      where: { id: companyId },
      data: {
        status: CompanyStatus.ACTIVE,
        rejectedAt: null,
        rejectReason: null,
      },
    });

    await this.assignTrialOnRegister(updated.pk, updated.id);

    await this.auditLog.logForActor(actor, {
      action: AuditAction.APPROVE,
      module: 'COMPANY',
      targetId: companyId,
      targetType: 'Company',
      description: 'Platform approved company registration',
      companyPk: updated.pk,
      companyId: updated.id,
    });
    return this.session.stripSecret(updated);
  }

  async rejectCompany(
    actor: AuthenticatedRequestUser,
    companyId: string,
    reason?: string,
  ) {
    this.assertPlatformSuperAdmin(actor);
    const company = await this.requireCompany(companyId);
    if (company.status !== CompanyStatus.PENDING_APPROVAL) {
      throw new BadRequestException(['Company is not pending approval']);
    }
    const updated = await this.prisma.company.update({
      where: { id: companyId },
      data: {
        status: CompanyStatus.REJECTED,
        rejectedAt: new Date(),
        rejectReason: reason,
      },
    });
    await this.auditLog.logForActor(actor, {
      action: AuditAction.REJECT,
      module: 'COMPANY',
      targetId: companyId,
      targetType: 'Company',
      description: reason ?? 'Platform rejected company registration',
      companyPk: updated.pk,
      companyId: updated.id,
    });
    return this.session.stripSecret(updated);
  }

  async approveClient(actor: AuthenticatedRequestUser, clientId: string) {
    this.assertNotImpersonating(actor, 'approve clients');
    const companyId = this.requireCompanyActor(actor).id;
    const client = await this.requireOwnedClient(clientId, companyId);
    if (client.status !== ClientStatus.PENDING_APPROVAL) {
      throw new BadRequestException(['Client is not pending approval']);
    }
    const updated = await this.prisma.client.update({
      where: { id: clientId },
      data: {
        status: ClientStatus.ACTIVE,
        rejectedAt: null,
        rejectReason: null,
      },
    });
    await this.auditLog.logForActor(actor, {
      action: AuditAction.APPROVE,
      module: 'CLIENT',
      targetId: clientId,
      targetType: 'Client',
      description: 'Company approved client registration',
      companyPk: actor.pk,
      companyId,
    });
    return this.session.stripSecret(updated);
  }

  async rejectClient(
    actor: AuthenticatedRequestUser,
    clientId: string,
    reason?: string,
  ) {
    this.assertNotImpersonating(actor, 'reject clients');
    const companyId = this.requireCompanyActor(actor).id;
    const client = await this.requireOwnedClient(clientId, companyId);
    if (client.status !== ClientStatus.PENDING_APPROVAL) {
      throw new BadRequestException(['Client is not pending approval']);
    }
    const updated = await this.prisma.client.update({
      where: { id: clientId },
      data: {
        status: ClientStatus.REJECTED,
        rejectedAt: new Date(),
        rejectReason: reason,
      },
    });
    await this.auditLog.logForActor(actor, {
      action: AuditAction.REJECT,
      module: 'CLIENT',
      targetId: clientId,
      targetType: 'Client',
      description: reason ?? 'Company rejected client registration',
      companyPk: actor.pk,
      companyId,
    });
    return this.session.stripSecret(updated);
  }

  async createPlatformStaff(
    actor: AuthenticatedRequestUser,
    dto: CreatePlatformStaffDto,
  ) {
    this.assertPlatformSuperAdmin(actor);
    this.assertPassword(dto.password);
    await this.assertEmailAvailable(dto.email);
    const existing = await this.prisma.platformStaff.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) throw new BadRequestException(['Email already exists']);

    const staff = await this.prisma.platformStaff.create({
      data: {
        email: dto.email.toLowerCase(),
        password: await this.hashingService.hash(dto.password),
        role: dto.role,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        active: ActiveStatus.ACTIVE,
      },
    });

    await this.auditLog.logForActor(actor, {
      action: AuditAction.CREATE,
      module: 'PLATFORM_STAFF',
      targetId: staff.id,
      targetType: 'PlatformStaff',
      description: `Created platform staff ${staff.email}`,
    });

    return this.session.stripSecret(staff);
  }

  async assignCompany(actor: AuthenticatedRequestUser, dto: AssignCompanyDto) {
    this.assertPlatformSuperAdmin(actor);
    const staff = await this.prisma.platformStaff.findUnique({
      where: { id: dto.platformStaffId },
    });
    if (!staff) throw new NotFoundException('Platform staff not found');
    const company = await this.requireCompany(dto.companyId);

    const existing = await this.prisma.platformStaffAssignment.findFirst({
      where: { platformStaffId: staff.id, companyId: company.id },
    });
    if (existing) return existing;

    const assignment = await this.prisma.platformStaffAssignment.create({
      data: {
        platformStaff: { connect: { id: staff.id } },
        company: { connect: { id: company.id } },
        assignedByPk: actor.pk,
        assignedById: actor.id,
      },
    });

    await this.auditLog.logForActor(actor, {
      action: AuditAction.CREATE,
      module: 'PLATFORM_ASSIGNMENT',
      targetId: assignment.id,
      targetType: 'PlatformStaffAssignment',
      description: `Assigned ${staff.email} to ${company.name}`,
      companyPk: company.pk,
      companyId: company.id,
    });

    return assignment;
  }

  async unassignCompany(actor: AuthenticatedRequestUser, assignmentId: string) {
    this.assertPlatformSuperAdmin(actor);
    const assignment = await this.prisma.platformStaffAssignment.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');
    await this.prisma.platformStaffAssignment.delete({
      where: { id: assignmentId },
    });
    return { message: 'Assignment removed' };
  }

  async impersonateCompany(actor: AuthenticatedRequestUser, companyId: string) {
    this.assertPlatform(actor);
    const company = await this.requireCompany(companyId);
    if (company.status !== CompanyStatus.ACTIVE) {
      throw new BadRequestException([
        'Only an active company can be impersonated',
      ]);
    }

    const assignment = await this.prisma.platformStaffAssignment.findFirst({
      where: { platformStaffId: actor.id, companyId: company.id },
    });
    if (!assignment) {
      throw new ForbiddenException('This company is not assigned to you');
    }

    const hydrated = await this.session.hydrateAccount(
      AccountType.COMPANY,
      company.id,
      actor.id,
    );

    await this.auditLog.logForActor(actor, {
      action: AuditAction.IMPERSONATE,
      module: 'COMPANY',
      targetId: company.id,
      targetType: 'Company',
      description: `Platform staff ${actor.email} impersonated company`,
      companyPk: company.pk,
      companyId: company.id,
    });

    return this.session.issueSession(hydrated.account, {
      ...hydrated.userAccount,
      impersonatedBy: actor.id,
    });
  }

  async createCompanyStaff(
    actor: AuthenticatedRequestUser,
    dto: CreateCompanyStaffDto,
  ) {
    this.assertNotImpersonating(actor, 'create staff');
    const company = this.requireCompanyActor(actor);
    this.assertPassword(dto.password);
    await this.assertEmailAvailable(dto.email);

    if (
      await this.prisma.staff.findUnique({
        where: { email: dto.email.toLowerCase() },
      })
    ) {
      throw new BadRequestException(['Email already exists']);
    }
    if (await this.prisma.staff.findUnique({ where: { phone: dto.phone } })) {
      throw new BadRequestException(['Phone number already exists']);
    }

    const employeeId = dto.employeeId ?? this.generateEmployeeId('STF');
    if (await this.prisma.staff.findUnique({ where: { employeeId } })) {
      throw new BadRequestException(['Employee ID already exists']);
    }

    const staff = await this.prisma.staff.create({
      data: {
        email: dto.email.toLowerCase(),
        phone: dto.phone,
        password: await this.hashingService.hash(dto.password),
        employeeId,
        role: dto.role,
        active: ActiveStatus.ACTIVE,
        company: { connect: { id: company.id } },
        profile: {
          create: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            middleName: dto.middleName ?? '',
          },
        },
      },
      include: { profile: true },
    });

    await this.auditLog.logForActor(actor, {
      action: AuditAction.CREATE,
      module: 'STAFF',
      targetId: staff.id,
      targetType: 'Staff',
      description: `Company created staff ${staff.email}`,
      companyPk: company.pk,
      companyId: company.id,
      staffPk: staff.pk,
      staffId: staff.id,
    });

    return this.session.stripSecret(staff);
  }

  async disableStaff(actor: AuthenticatedRequestUser, staffId: string) {
    return this.setStaffActive(actor, staffId, ActiveStatus.INACTIVE);
  }

  async enableStaff(actor: AuthenticatedRequestUser, staffId: string) {
    return this.setStaffActive(actor, staffId, ActiveStatus.ACTIVE);
  }

  async createCompanyClient(
    actor: AuthenticatedRequestUser,
    dto: CreateCompanyClientDto,
  ) {
    this.assertNotImpersonating(actor, 'create clients');
    const company = this.requireCompanyActor(actor);
    this.assertPassword(dto.password);
    await this.assertUniqueClient(dto.email, dto.phone);

    const client = await this.prisma.client.create({
      data: {
        name: dto.name,
        slug: this.generateSlug(dto.name),
        email: dto.email.toLowerCase(),
        phone: cleanPhone(dto.phone),
        password: await this.hashingService.hash(dto.password),
        clientType: dto.clientType ?? ClientType.ORGANIZATION,
        status: ClientStatus.ACTIVE,
        onboardingMethod: OnboardingMethod.STAFF_ONBOARDED,
        city: dto.city,
        state: dto.state,
        country: dto.country,
        company: { connect: { id: company.id } },
      },
    });

    await this.auditLog.logForActor(actor, {
      action: AuditAction.CREATE,
      module: 'CLIENT',
      targetId: client.id,
      targetType: 'Client',
      description: 'Company onboarded client (auto-approved)',
      companyPk: company.pk,
      companyId: company.id,
    });

    return this.session.stripSecret(client);
  }

  private async loginByType(
    accountType: AccountType,
    email: string,
    password: string,
  ) {
    const attemptsKey = `login_attempts_${accountType}_${email}`;
    const blockedKey = `login_blocked_${accountType}_${email}`;
    await this.checkLoginBlock(blockedKey);

    const record = await this.findLoginRecord(accountType, email);
    if (
      !record ||
      !(await this.hashingService.compare(password, record.password))
    ) {
      await this.recordFailedAttempt(attemptsKey, blockedKey);
      throw new BadRequestException(['Invalid email or password']);
    }

    await this.clearLoginBlock(attemptsKey, blockedKey);

    if (record.mfaEnabled) {
      const hydrated = await this.session.hydrateAccount(
        accountType,
        record.id,
      );
      const otp = generateOtp();
      await this.cache.set(
        this.mfaKey(accountType, record.id),
        otp,
        OTP_EXPIRY,
      );
      try {
        await this.emailService.sendOtp(record.email, {
          name: record.name,
          otp,
        });
      } catch (error) {
        console.error('MFA email failed:', error);
      }
      return this.session.issueMfaChallenge(hydrated.account);
    }

    const hydrated = await this.session.hydrateAccount(accountType, record.id);
    await this.touchLastLogin(accountType, record.id);
    return this.session.issueSession(hydrated.account, hydrated.userAccount);
  }

  private async findLoginRecord(accountType: AccountType, email: string) {
    const normalized = email.toLowerCase();
    switch (accountType) {
      case AccountType.PLATFORM_STAFF: {
        const row = await this.prisma.platformStaff.findUnique({
          where: { email: normalized },
        });
        return row
          ? {
              id: row.id,
              email: row.email,
              password: row.password,
              mfaEnabled: row.mfaEnabled,
              name:
                `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim() ||
                row.email,
            }
          : null;
      }
      case AccountType.COMPANY: {
        const row = await this.prisma.company.findUnique({
          where: { email: normalized },
        });
        return row
          ? {
              id: row.id,
              email: row.email,
              password: row.password,
              mfaEnabled: row.mfaEnabled,
              name: row.name,
            }
          : null;
      }
      case AccountType.STAFF: {
        const row = await this.prisma.staff.findUnique({
          where: { email: normalized },
          include: { profile: true },
        });
        return row
          ? {
              id: row.id,
              email: row.email,
              password: row.password,
              mfaEnabled: row.mfaEnabled,
              name:
                `${row.profile?.firstName ?? ''} ${
                  row.profile?.lastName ?? ''
                }`.trim() || row.email,
            }
          : null;
      }
      case AccountType.GUARD: {
        const row = await this.prisma.guard.findUnique({
          where: { email: normalized },
          include: { profile: true },
        });
        return row
          ? {
              id: row.id,
              email: row.email,
              password: row.password,
              mfaEnabled: row.mfaEnabled,
              name:
                `${row.profile?.firstName ?? ''} ${
                  row.profile?.lastName ?? ''
                }`.trim() || row.email,
            }
          : null;
      }
      case AccountType.CLIENT: {
        const row = await this.prisma.client.findUnique({
          where: { email: normalized },
        });
        return row
          ? {
              id: row.id,
              email: row.email,
              password: row.password,
              mfaEnabled: row.mfaEnabled,
              name: row.name,
            }
          : null;
      }
      case AccountType.CLIENT_STAFF: {
        const row = await this.prisma.clientStaff.findUnique({
          where: { email: normalized },
          include: { profile: true },
        });
        return row
          ? {
              id: row.id,
              email: row.email,
              password: row.password,
              mfaEnabled: row.mfaEnabled,
              name:
                `${row.profile?.firstName ?? ''} ${
                  row.profile?.lastName ?? ''
                }`.trim() || row.email,
            }
          : null;
      }
      default:
        return null;
    }
  }

  private async setStaffActive(
    actor: AuthenticatedRequestUser,
    staffId: string,
    active: ActiveStatus,
  ) {
    this.assertNotImpersonating(actor, 'change staff status');
    const company = this.requireCompanyActor(actor);
    const staff = await this.prisma.staff.findUnique({
      where: { id: staffId },
    });
    if (!staff || staff.companyId !== company.id) {
      throw new NotFoundException('Staff not found');
    }
    const updated = await this.prisma.staff.update({
      where: { id: staffId },
      data: { active },
      include: { profile: true },
    });
    if (active !== ActiveStatus.ACTIVE) {
      await this.session.revokeAllSessions(AccountType.STAFF, staff.id);
    }
    await this.auditLog.logForActor(actor, {
      action: AuditAction.UPDATE,
      module: 'STAFF',
      targetId: staff.id,
      targetType: 'Staff',
      description: `Staff set to ${active}`,
      companyPk: company.pk,
      companyId: company.id,
      staffPk: staff.pk,
      staffId: staff.id,
    });
    return this.session.stripSecret(updated);
  }

  private async setMfa(
    accountType: AccountType,
    id: string,
    mfaEnabled: boolean,
  ) {
    switch (accountType) {
      case AccountType.PLATFORM_STAFF:
        await this.prisma.platformStaff.update({
          where: { id },
          data: { mfaEnabled },
        });
        break;
      case AccountType.COMPANY:
        await this.prisma.company.update({
          where: { id },
          data: { mfaEnabled },
        });
        break;
      case AccountType.STAFF:
        await this.prisma.staff.update({ where: { id }, data: { mfaEnabled } });
        break;
      case AccountType.GUARD:
        await this.prisma.guard.update({ where: { id }, data: { mfaEnabled } });
        break;
      case AccountType.CLIENT:
        await this.prisma.client.update({
          where: { id },
          data: { mfaEnabled },
        });
        break;
      case AccountType.CLIENT_STAFF:
        await this.prisma.clientStaff.update({
          where: { id },
          data: { mfaEnabled },
        });
        break;
      default:
        throw new BadRequestException([
          'MFA is not supported for this account type',
        ]);
    }
  }

  private async updatePassword(
    accountType: AccountType,
    id: string,
    password: string,
  ) {
    const hashed = await this.hashingService.hash(password);
    switch (accountType) {
      case AccountType.PLATFORM_STAFF:
        await this.prisma.platformStaff.update({
          where: { id },
          data: { password: hashed },
        });
        break;
      case AccountType.COMPANY:
        await this.prisma.company.update({
          where: { id },
          data: { password: hashed },
        });
        break;
      case AccountType.STAFF:
        await this.prisma.staff.update({
          where: { id },
          data: { password: hashed },
        });
        break;
      case AccountType.GUARD:
        await this.prisma.guard.update({
          where: { id },
          data: { password: hashed },
        });
        break;
      case AccountType.CLIENT:
        await this.prisma.client.update({
          where: { id },
          data: { password: hashed },
        });
        break;
      case AccountType.CLIENT_STAFF:
        await this.prisma.clientStaff.update({
          where: { id },
          data: { password: hashed },
        });
        break;
      default:
        throw new BadRequestException([
          'Password reset is not supported for this account type',
        ]);
    }
  }

  private async touchLastLogin(accountType: AccountType, id: string) {
    const data = { lastLoginAt: new Date() };
    switch (accountType) {
      case AccountType.PLATFORM_STAFF:
        await this.prisma.platformStaff.update({ where: { id }, data });
        break;
      case AccountType.COMPANY:
        await this.prisma.company.update({ where: { id }, data });
        break;
      case AccountType.STAFF:
        await this.prisma.staff.update({ where: { id }, data });
        break;
      case AccountType.GUARD:
        await this.prisma.guard.update({ where: { id }, data });
        break;
      case AccountType.CLIENT:
        await this.prisma.client.update({ where: { id }, data });
        break;
      case AccountType.CLIENT_STAFF:
        await this.prisma.clientStaff.update({ where: { id }, data });
        break;
      default:
        break;
    }
  }

  private async assertCurrentPassword(
    user: AuthenticatedRequestUser,
    password: string,
  ) {
    const record = await this.findLoginRecord(user.accountType, user.email);
    if (
      !record ||
      !(await this.hashingService.compare(password, record.password))
    ) {
      throw new BadRequestException(['Current password is incorrect']);
    }
  }

  private async assertUniqueCompany(email: string, domain: string) {
    if (
      await this.prisma.company.findUnique({
        where: { email: email.toLowerCase() },
      })
    ) {
      throw new BadRequestException(['Email already registered']);
    }
    if (await this.prisma.company.findUnique({ where: { domain } })) {
      throw new BadRequestException(['Domain already registered']);
    }
  }

  private async assertUniqueClient(email: string, phone: string) {
    if (
      await this.prisma.client.findUnique({
        where: { email: email.toLowerCase() },
      })
    ) {
      throw new BadRequestException(['Email already registered']);
    }
    const existingPhone = await this.prisma.client.findUnique({
      where: { phone: cleanPhone(phone) },
    });
    if (existingPhone) {
      throw new BadRequestException(['Phone number already registered']);
    }
  }

  /** Emails must be unique across all login identity tables. */
  private async assertEmailAvailable(email: string) {
    const normalized = email.toLowerCase();
    const [platform, company, staff, guard, client, clientStaff] =
      await Promise.all([
        this.prisma.platformStaff.findUnique({ where: { email: normalized } }),
        this.prisma.company.findUnique({ where: { email: normalized } }),
        this.prisma.staff.findUnique({ where: { email: normalized } }),
        this.prisma.guard.findUnique({ where: { email: normalized } }),
        this.prisma.client.findUnique({ where: { email: normalized } }),
        this.prisma.clientStaff.findUnique({ where: { email: normalized } }),
      ]);
    if (platform || company || staff || guard || client || clientStaff) {
      throw new BadRequestException(['Email already registered']);
    }
  }

  private async requireCompany(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  private async requireOwnedClient(clientId: string, companyId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });
    if (!client || client.companyId !== companyId) {
      throw new NotFoundException('Client not found');
    }
    return client;
  }

  private requireCompanyActor(user: AuthenticatedRequestUser) {
    if (user.accountType !== AccountType.COMPANY) {
      throw new ForbiddenException(
        'Only a company account can perform this action',
      );
    }
    return user;
  }

  private assertPlatform(user: AuthenticatedRequestUser) {
    if (user.accountType !== AccountType.PLATFORM_STAFF) {
      throw new ForbiddenException('Platform staff only');
    }
  }

  private assertPlatformSuperAdmin(user: AuthenticatedRequestUser) {
    this.assertPlatform(user);
    const role = (user as PlatformStaff).role;
    if (role !== PlatformStaffRole.PLATFORM_SUPER_ADMIN) {
      throw new ForbiddenException('Platform super admin only');
    }
  }

  private assertNotImpersonating(
    user: AuthenticatedRequestUser,
    action: string,
  ) {
    if (user.impersonatedBy) {
      throw new ForbiddenException(`Cannot ${action} while impersonating`);
    }
  }

  private assertPassword(password: string) {
    if (!validatePassword(password)) {
      throw new BadRequestException([
        'Password must be at least 8 characters, contain uppercase, lowercase, number, special character, and no spaces',
      ]);
    }
  }

  private async checkLoginBlock(blockedKey: string) {
    if (await this.cache.get(blockedKey)) {
      throw new BadRequestException([
        'Too many failed attempts. You are blocked for 2 minutes.',
      ]);
    }
  }

  private async recordFailedAttempt(attemptsKey: string, blockedKey: string) {
    const attempts = ((await this.cache.get<number>(attemptsKey)) || 0) + 1;
    await this.cache.set(attemptsKey, attempts, 60000);
    if (attempts >= this.MAX_ATTEMPTS) {
      await this.cache.set(blockedKey, true, this.BLOCK_TIME_MS);
      throw new BadRequestException([
        'Too many failed attempts. You are blocked for 2 minutes.',
      ]);
    }
  }

  private async clearLoginBlock(attemptsKey: string, blockedKey: string) {
    await Promise.all([
      this.cache.del(attemptsKey),
      this.cache.del(blockedKey),
    ]);
  }

  private normalizeDomain(domain: string) {
    return domain.trim().toLowerCase();
  }

  private generateSlug(text: string) {
    return (
      text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') +
      '-' +
      Date.now()
    );
  }

  private generateEmployeeId(prefix: string) {
    return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
  }

  private mfaKey(accountType: AccountType, id: string) {
    return `mfa_otp_${accountType}_${id}`;
  }

  private resetKey(accountType: AccountType, email: string) {
    return `password_reset_${accountType}_${email.toLowerCase()}`;
  }
}
