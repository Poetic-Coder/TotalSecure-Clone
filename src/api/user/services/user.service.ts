import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { generateOtp } from '@common/utils/otp';
import { Cache } from 'cache-manager';
import { SmsService } from '@modules/network/services/sms/sms.service';
import { OTP_EXPIRY } from '@common/constants';
import { AccountType } from '@common/enums';

import { HashingService } from '@modules/hashing/hashing.service';
import { PrismaService } from '@database/prisma.service';
import { AnyUser } from '@common/interfaces';
import { ConfigService } from '@nestjs/config';
import { APP_ENV } from '@common/interfaces';
import { EmailService } from '@modules/network/services/email/email.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly hashingService: HashingService,
    private readonly configService: ConfigService,
  ) {}

  private readonly logger = new Logger(UserService.name);

  async setPhoneVerified(userId: string, accountType: AccountType) {
    if (!Object.values(AccountType).includes(accountType)) {
      throw new BadRequestException('Invalid account type provided.');
    }
    return this.prisma[accountType].update({
      where: { id: userId },
      data: { phoneVerified: true },
    });
  }

 
  async setEmailVerified(userId: string, accountType: AccountType) {
    if (!Object.values(AccountType).includes(accountType)) {
      throw new BadRequestException('Invalid account type provided.');
    }
    return this.prisma[accountType].update({
      where: { id: userId },
      data: { emailVerified: true },
    });
  }

  public async sendEmailOtp(email: string) {
    const otp = generateOtp();

    // Pretty print otp very clearly on the console
    this.logger.debug(`\nOTP: ${otp}\n`);

    // Save otp to cache
    await this.cacheManager.set(email, otp, OTP_EXPIRY);

    // Send otp to email
    const name = email.split('@')[0];
    await this.emailService.sendOtp(email, { name, otp });

    return otp;
  }

  public async sendPhoneOtp(phone: string) {
    const otp = generateOtp();

    // Pretty print otp very clearly on the console
    this.logger.debug(`\nOTP: ${otp}\n`);

    // Save otp to cache
    await this.cacheManager.set(phone, otp, OTP_EXPIRY);

    const message = `Please, confirm your registered phone number on Saudia with this code ${otp}`;

    // Send otp to phone
    const response = await this.smsService.send(phone, message);
    this.logger.debug(response);
    return otp;
  }

  public async verifyEmailOtp(email: string, otp: string) {
    const NODE_ENV = this.configService.get<APP_ENV>('NODE_ENV');
    if (NODE_ENV === 'development') {
      if (otp === '123456') {
        return true;
      }
    }

    const cachedOtp = await this.cacheManager.get<string>(email);
    this.logger.debug(`\nCached OTP: ${cachedOtp}\n`);
    if (cachedOtp === otp) {
      await this.cacheManager.del(email);
      return true;
    }
    return false;
  }

  public async verifyPhoneOtp(phone: string, otp: string) {
    const NODE_ENV = this.configService.get<APP_ENV>('NODE_ENV');

    if (NODE_ENV === 'development') {
      if (otp === '123456') {
        return true;
      }
    }

    const cachedOtp = await this.cacheManager.get<string>(phone);
    this.logger.debug(`\nCached OTP: ${cachedOtp}\n`);
    if (cachedOtp === otp) {
      await this.cacheManager.del(phone);
      return true;
    }

    return false;
  }

  public async sendOtpAndEmail(payload: { email?: string; phone?: string }) {
    const otp = generateOtp();

    this.logger.debug(`\nOTP: ${otp}\n`);

    
    await Promise.allSettled([
    payload.email &&
      this.cacheManager.set(payload.email, otp, OTP_EXPIRY).then(() =>
        this.emailService.sendOtp(payload.email, { name: payload.email.split('@')[0], otp })
      ),

    payload.phone &&
      this.cacheManager.set(payload.phone, otp, OTP_EXPIRY).then(() =>
        this.smsService.send(
          payload.phone,
          `Please, confirm your registered phone number on Saudia with this code ${otp}`
        )
      ),
  ]);

  return otp;
  }

  private getAccountType(user: AnyUser): AccountType | null {
      if ('employeeId' in user && 'role' in user) return AccountType.STAFF;
      if ('employeeId' in user && 'status' in user) return AccountType.GUARD;
      if ('clientType' in user) return AccountType.CLIENT;
      if ('domain' in user) return AccountType.COMPANY;
      return null;
  }
}
