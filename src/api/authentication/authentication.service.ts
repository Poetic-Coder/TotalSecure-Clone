import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Inject,
  CACHE_MANAGER,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { HashingService } from '@modules/hashing/hashing.service';
import { SecurityService } from '@modules/security/security.service';
import { StaffWithProfile } from '@api/user/repositories/staff.repository';
import { UserService } from '@api/user/services/user.service';
import { StaffService } from '@api/user/services/staff.service';
import { TokenType } from '@modules/security/security.interface';
import { PrismaService } from '@database/prisma.service';
import { JWT_EXPIRES_IN } from '@common/constants';
import { AnyUser } from '@common/interfaces';
import { RegisterGuardDto, RegisterStaffDto } from './dtos/register.dto';
import { GuardService } from '@api/user/services/guard.service';

@Injectable()
export class AuthenticationService {
  private readonly MAX_LOGIN_ATTEMPTS = 3;
  private readonly LOGIN_BLOCK_TIME_MINUTES = 2;

  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly staffService: StaffService,
    private readonly hashingService: HashingService,
    private readonly securityService: SecurityService,
    private readonly configService: ConfigService,
    private readonly guardService: GuardService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  
  public async loginStaff(email: string, password: string) {
    const loginAttemptsKey = `login_attempts_${email}`;
    const blockedKey = `login_blocked_${email}`;
  
    const isBlocked = await this.cacheManager.get(blockedKey);
    if (isBlocked) {
      throw new BadRequestException([
        'You have been blocked from logging in for 30 minutes due to multiple failed attempts',
      ]);
    }
  
    const user = (await this.staffService.deepFind({
      where: { email: email },
      include: {
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            homeAddress: true,
            photo: true,
            dob: true,
            gender: true,
            nationality: true,
            state: true,
            city: true,
            country: true,
            postalCode: true,
          },
        },
      },
    })) as StaffWithProfile;
  
    if (!user) {
      throw new BadRequestException(['Email not found in our record']);
    }
  
    if (!(await this.hashingService.compare(password, user.password))) {
      const attempts = ((await this.cacheManager.get<number>(loginAttemptsKey)) || 0) + 1;
      
      try {
        await this.cacheManager.set(loginAttemptsKey, attempts, 60000);
      } catch (error) {
        console.error('Cache error:', error);
      }
  
      // Block user if max attempts reached
      if (attempts >= this.MAX_LOGIN_ATTEMPTS) {
        await this.cacheManager.set(blockedKey, true, 60000);
        throw new BadRequestException([
          'You have been blocked from logging in for 30 minutes due to multiple failed attempts',
        ]);
      }
  
      throw new BadRequestException(['Email and password do not match']);
    }
  
    await Promise.all([
      this.cacheManager.del(loginAttemptsKey),
      this.cacheManager.del(blockedKey),
    ]);
  
    if (!user.active) {
      throw new BadRequestException(['Your account is not active']);
    }
  
    return user;
  }

  public async authenticate(user: AnyUser) {
    const accountType = this.userService['getAccountType'](user);

    const tokenUserAccount = {
      id: user.id,
      accountType,
    };

    const token = await this.securityService.generateToken({
      data: {
        tokenType: TokenType.ACCESS,
        account: tokenUserAccount,
      },
      expiresIn: JWT_EXPIRES_IN,
    });

    return token;
  }


  public async resendOtp(user: AnyUser) {
    await Promise.allSettled([
      this.userService.sendPhoneOtp(user.phone),
      this.userService.sendEmailOtp(user.email),
    ]);
  }


  public async verifyOtp(user: AnyUser, otp: string) {

    const phoneVerified = await this.userService.verifyPhoneOtp(user.phone,  otp);

    const emailVerified = await this.userService.verifyEmailOtp(user.email, otp,);

    if (phoneVerified) {
      const accountType = this.userService['getAccountType'](user); 
      await this.userService.setPhoneVerified(user.id, accountType);
    } else if (emailVerified) {
      const accountType = this.userService['getAccountType'](user); 
      await this.userService.setEmailVerified(user.id, accountType);
    }

    return phoneVerified || emailVerified;
  }

  public async createStaff(staff: RegisterStaffDto) {
    if (staff.email && (await this.staffService.findByEmail(staff.email))) {
      throw new BadRequestException(['Email already exists']);
    }

    if (!staff.phone.startsWith('+')) {
      throw new BadRequestException([
        'Phone number must be in international format',
      ]);
    }

    const currentUser = await this.staffService.findByPhone(staff.phone);
    if (currentUser) {
      throw new BadRequestException(['Phone number already exists']);
    }

    const hashedPassword = await this.hashingService.hash(staff.password);

    const newStaff = await this.staffService.create({
      email: staff.email,
      employeeId: staff.employeeId,
      role: staff.role,
      password: hashedPassword,
      phone: staff.phone || '',
      profile: {
        create: {
          gender: staff.gender,
          firstName: staff.firstName,
          lastName: staff.lastName,
          middleName: staff.middleName || ''
        }
      }
    });
    return newStaff
  }

  public async createGuard(guard: RegisterGuardDto) {
    if (guard.email && (await this.guardService.findByEmail(guard.email))) {
      throw new BadRequestException(['Email already exists']);
    }

    if (!guard.phone.startsWith('+')) {
      throw new BadRequestException([
        'Phone number must be in international format',
      ]);
    }

    const currentGuard = await this.guardService.findByPhone(guard.phone);
    if (currentGuard) {
      throw new BadRequestException(['Phone number already exists']);
    }

    const hashedPassword = await this.hashingService.hash(guard.password);

    const newGuard = await this.guardService.create({
      email: guard.email,
      employeeId: guard.employeeId,
      password: hashedPassword,
      phone: guard.phone || '',
      profile: {
        create: {
          firstName: guard.firstName,
          lastName: guard.lastName,
          middleName: guard.middleName || '',
          gender: guard.gender
        }
      }
    })
    return `New Guard ${newGuard.profile.firstName} ${newGuard.profile.middleName} ${newGuard.profile.lastName} has been added!`
  }

}