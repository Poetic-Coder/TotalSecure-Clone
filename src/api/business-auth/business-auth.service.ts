import {
  Injectable,
  BadRequestException,
  Inject,
  CACHE_MANAGER,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { PrismaService } from '@database/prisma.service';
import { HashingService } from '@modules/hashing/hashing.service';
import { SecurityService } from '@modules/security/security.service';
import { TokenType } from '@modules/security/security.interface';
import { JWT_EXPIRES_IN, OTP_EXPIRY } from '@common/constants';
import { AccountType } from '@common/enums';
import { EmailService } from '@modules/network/services/email/email.service';
import { SmsService } from '@modules/network/services/sms/sms.service';
import { RegisterClientDto } from './dtos/register-client.dto';
import { VerifyOtpDto } from './dtos/verify-otp.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { ClientType, ClientStatus, OnboardingMethod } from '@prisma/client';
import { generateOtp } from '@common/utils/otp';
import { validatePassword } from '@common/utils/password';
import ExcludeProperty from '@common/utils/exclude-property';
import { cleanPhone } from '@common/utils/phone';

@Injectable()
export class BusinessAuthService {
  private readonly MAX_ATTEMPTS = 3;
  private readonly BLOCK_TIME_MS = 2 * 60 * 1000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly hashingService: HashingService,
    private readonly securityService: SecurityService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // CLIENT LOGIN 

  async loginClient(dto: {email: string, password: string}) {
    const { email, password } = dto;
    const attemptsKey = `client_attempts_${email}`;
    const blockedKey = `client_blocked_${email}`;

    await this.checkLoginBlock(blockedKey);

    const client = await this.prisma.client.findUnique({
      where: { email },
    });

    if (!client) {
      await this.recordFailedAttempt(attemptsKey, blockedKey);
     throw new BadRequestException(['Invalid email']);
    }

    const passwordMatch = await this.hashingService.compare(
      password,
      client.password,
    );

    if (!passwordMatch) {
      await this.recordFailedAttempt(attemptsKey, blockedKey);
      throw new BadRequestException(['Invalid password']);
    }

    await this.clearLoginBlock(attemptsKey, blockedKey);

    if (client.status !== 'ACTIVE') {
      throw new BadRequestException([
        `Your account is ${client.status.toLowerCase()}. Contact support.`,
      ]);
    }

    await this.prisma.client.update({
      where: { pk: client.pk },
      data: { lastLoginAt: new Date() },
    });

    const token = await this.securityService.generateToken({
      data: {
        tokenType: TokenType.ACCESS,
        account: {
          id: client.id,
          email: client.email,
          accountType: AccountType.CLIENT,
          clientType: client.clientType,
        },
      },
      expiresIn: JWT_EXPIRES_IN,
    });

    return {
      token,
     userAccount: ExcludeProperty(client, ['password']),
    };
  }

  // CLIENT STAFF LOGIN

  async loginClientStaff(dto: {email: string, password: string}) {
    const { email, password } = dto;
    const attemptsKey = `clientstaff_attempts_${email}`;
    const blockedKey = `clientstaff_blocked_${email}`;

    await this.checkLoginBlock(blockedKey);

    const clientStaff = await this.prisma.clientStaff.findUnique({
      where: { email },
      include: {
        profile: true,
        client: true,
      },
    });

    if (!clientStaff) {
      await this.recordFailedAttempt(attemptsKey, blockedKey);
      throw new BadRequestException(['Invalid Email']);
    }

    const passwordMatch = await this.hashingService.compare(
      password,
      clientStaff.password,
    );

    if (!passwordMatch) {
      await this.recordFailedAttempt(attemptsKey, blockedKey);
      throw new BadRequestException(['Invalid Password']);
    }

    await this.clearLoginBlock(attemptsKey, blockedKey);

    if (clientStaff.active !== 'ACTIVE') {
      throw new BadRequestException([
        `Your account is ${clientStaff.active.toLowerCase()}. Contact your administrator.`,
      ]);
    }

    // Parent client must also be active
    if (clientStaff.client.status !== 'ACTIVE') {
      throw new BadRequestException([
        'Your organization account is not active. Contact support.',
      ]);
    }

    await this.prisma.clientStaff.update({
      where: { pk: clientStaff.pk },
      data: { lastLoginAt: new Date() },
    });

    const token = await this.securityService.generateToken({
      data: {
        tokenType: TokenType.ACCESS,
        account: {
          id: clientStaff.id,
          email: clientStaff.email,
          accountType: AccountType.CLIENT_STAFF,
          clientId: clientStaff.client.id,
          clientRole: clientStaff.role,
        },
      },
      expiresIn: JWT_EXPIRES_IN,
    });

    return {
      token,
      userAccount: ExcludeProperty(clientStaff, ['password']),
    };
  }

  // SHARED HELPERS 

  private async checkLoginBlock(blockedKey: string) {
    const isBlocked = await this.cacheManager.get(blockedKey);
    if (isBlocked) {
      throw new BadRequestException([
        'Too many failed attempts. You are blocked for 2 minutes.',
      ]);
    }
  }

  private async recordFailedAttempt(
    attemptsKey: string,
    blockedKey: string,
  ) {
    const attempts =
      ((await this.cacheManager.get<number>(attemptsKey)) || 0) + 1;
    await this.cacheManager.set(attemptsKey, attempts, 60000);

    if (attempts >= this.MAX_ATTEMPTS) {
      await this.cacheManager.set(blockedKey, true, this.BLOCK_TIME_MS);
      throw new BadRequestException([
        'Too many failed attempts. You are blocked for 2 minutes.',
      ]);
    }
  }

  private async clearLoginBlock(attemptsKey: string, blockedKey: string) {
    await Promise.all([
      this.cacheManager.del(attemptsKey),
      this.cacheManager.del(blockedKey),
    ]);
  }


  private generateSlug(text: string): string {
    return (
      text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') +
      '-' +
      Date.now()
    );
  }

 private async activateIfFullyVerified(email: string) {
    const client = await this.prisma.client.findUnique({
      where: { email },
    });

    if (client && client.emailVerified && client.phoneVerified) {
      await this.prisma.client.update({
        where: { email },
        data: { status: ClientStatus.ACTIVE },
      });
    }
  }


// REGISTRATION

  async registerClient(dto: RegisterClientDto) {
    if (!validatePassword(dto.password)) {
      throw new BadRequestException([
        'Password must be at least 8 characters, contain uppercase, lowercase, number, special character, and no spaces',
      ]);
    }

    const existingEmail = await this.prisma.client.findUnique({
      where: { email: dto.email },
    });

       if (existingEmail) {
      throw new BadRequestException(['Email already registered']);
    }

    const normalizedPhone = dto.phone ? cleanPhone(dto.phone) : undefined;
      if (normalizedPhone) {
    const existingPhone = await this.prisma.client.findUnique({
    where: { phone: normalizedPhone },
    });

      if (existingPhone) {
      throw new BadRequestException(['Phone number already registered']);
      }
    }    

    const hashedPassword = await this.hashingService.hash(dto.password);
    const slug = this.generateSlug(dto.name);

    const company = await this.prisma.company.findUnique({
      where: { id: dto.companyId },
    });
    if (!company) {
      throw new BadRequestException(['Company not found']);
    }

    const client = await this.prisma.client.create({
      data: {
        name: dto.name,
        slug,
        email: dto.email,
        phone: normalizedPhone,
        password: hashedPassword,
        clientType: dto.clientType ?? ClientType.ORGANIZATION,
        status: ClientStatus.INACTIVE,
        emailVerified: false,
        onboardingMethod: OnboardingMethod.SELF_SIGNUP,
        city: dto.city,
        state: dto.state,
        country: dto.country,
        company: {
          connect: { id: company.id },
        },
      },
    });

    // Generate and send email OTP
    const emailOtp = generateOtp();
    const emailOtpKey = `email_verify_${client.email}`;
    await this.cacheManager.set(emailOtpKey, emailOtp, OTP_EXPIRY);

    try {
      await this.emailService.sendOtp(client.email, {
        name: client.name,
        otp: emailOtp,
      });
    } catch (error) {
      console.error('Email OTP send failed:', error);
    }

    // Generate and send phone OTP
    if (normalizedPhone) {
      const phoneOtp = generateOtp();
      const phoneOtpKey = `phone_verify_${normalizedPhone}`;
      await this.cacheManager.set(phoneOtpKey, phoneOtp, OTP_EXPIRY);

      try {
        await this.smsService.send(
          normalizedPhone,
          `Your TSNL SMS verification code is: ${phoneOtp}. It expires in 30 minutes.`,
        );
      } catch (error) {
        console.error('SMS OTP send failed:', error);
      }
    }

    return {
      message:
        'Registration successful. Please verify your email and phone number to activate your account.',
      email: client.email,
      phone: normalizedPhone
    };
  }

// VERIFY EMAIL / PHONE
async verifyOtp(dto: VerifyOtpDto) {
  if (dto.email) {
    // Email verification
    const otpKey = `email_verify_${dto.email}`;
    const storedOtp = await this.cacheManager.get<string>(otpKey);

    if (!storedOtp || storedOtp !== dto.otp) {
      throw new BadRequestException(['Invalid or expired verification code']);
    }

    const client = await this.prisma.client.findUnique({
      where: { email: dto.email },
    });

    if (!client || client.emailVerified) {
      throw new BadRequestException(['Invalid or expired verification code']);
    }

    await this.prisma.client.update({
      where: { email: dto.email },
      data: { emailVerified: true },
    });

    await this.cacheManager.del(otpKey);
    await this.activateIfFullyVerified(dto.email);

    return { message: 'Email verified successfully.' };
  }

  if (dto.phone) {
    // Phone verification
    const normalizedPhone = cleanPhone(dto.phone);
    const otpKey = `phone_verify_${normalizedPhone}`;
    const storedOtp = await this.cacheManager.get<string>(otpKey);

    if (!storedOtp || storedOtp !== dto.otp) {
      throw new BadRequestException(['Invalid or expired verification code']);
    }

    const client = await this.prisma.client.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!client || client.phoneVerified) {
      throw new BadRequestException(['Invalid or expired verification code']);
    }

    await this.prisma.client.update({
      where: { phone: normalizedPhone },
      data: { phoneVerified: true },
    });

    await this.cacheManager.del(otpKey);
    await this.activateIfFullyVerified(client.email);

    return { message: 'Phone number verified successfully.' };
  }
}

  // FORGOT PASSWORD
  async forgotPassword(dto: ForgotPasswordDto) {
  const genericMessage =
    'If this account is registered, you will receive a reset code shortly.';

  if (dto.email) {
    const client = await this.prisma.client.findUnique({
      where: { email: dto.email },
    });

    if (!client) return { message: genericMessage };

    if (!client.emailVerified) {
      throw new BadRequestException([
        'Please verify your email first before resetting your password.',
      ]);
    }

    const otp = generateOtp();
    const otpKey = `password_reset_email_${dto.email}`;
    await this.cacheManager.set(otpKey, otp, OTP_EXPIRY);

    try {
      await this.emailService.sendOtp(dto.email, {
        name: client.name,
        otp,
      });
    } catch (error) {
      console.error('Forgot password email failed:', error);
    }

    return { message: genericMessage };
  }

  if (dto.phone) {
    const normalizedPhone = cleanPhone(dto.phone);
    const client = await this.prisma.client.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!client) return { message: genericMessage };

    if (!client.phoneVerified) {
      throw new BadRequestException([
        'Please verify your phone number first before resetting your password.',
      ]);
    }

    const otp = generateOtp();
    const otpKey = `password_reset_phone_${normalizedPhone}`;
    await this.cacheManager.set(otpKey, otp, OTP_EXPIRY);

    try {
      await this.smsService.send(
        normalizedPhone,
        `Your TSNL SMS password reset code is: ${otp}. It expires in 30 minutes.`,
      );
    } catch (error) {
      console.error('Forgot password SMS failed:', error);
    }

    return { message: genericMessage };
  }
}

  //  RESET PASSWORD 
  async resetPassword(dto: ResetPasswordDto) {
  if (!validatePassword(dto.newPassword)) {
    throw new BadRequestException([
      'Password must be at least 8 characters, contain uppercase, lowercase, number, special character, and no spaces',
    ]);
  }

  if (dto.email) {
    const otpKey = `password_reset_email_${dto.email}`;
    const storedOtp = await this.cacheManager.get<string>(otpKey);

    if (!storedOtp || storedOtp !== dto.otp) {
      throw new BadRequestException(['Invalid or expired reset code']);
    }

    const client = await this.prisma.client.findUnique({
      where: { email: dto.email },
    });

    if (!client) {
      throw new BadRequestException(['Invalid or expired reset code']);
    }

    const hashedPassword = await this.hashingService.hash(dto.newPassword);

    await this.prisma.client.update({
      where: { email: dto.email },
      data: { password: hashedPassword },
    });

    await this.cacheManager.del(otpKey);

    return {
      message: 'Password reset successfully. You can now log in.',
    };
  }

  if (dto.phone) {
    const normalizedPhone = cleanPhone(dto.phone);
    const otpKey = `password_reset_phone_${normalizedPhone}`;
    const storedOtp = await this.cacheManager.get<string>(otpKey);

    if (!storedOtp || storedOtp !== dto.otp) {
      throw new BadRequestException(['Invalid or expired reset code']);
    }

    const client = await this.prisma.client.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!client) {
      throw new BadRequestException(['Invalid or expired reset code']);
    }

    const hashedPassword = await this.hashingService.hash(dto.newPassword);

    await this.prisma.client.update({
      where: { phone: normalizedPhone },
      data: { password: hashedPassword },
    });

    await this.cacheManager.del(otpKey);

    return {
      message: 'Password reset successfully. You can now log in.',
    };
  }
}
}