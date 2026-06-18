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
import { AgentWithProfile } from '@api/user/repositories/agent.repository';
import { StaffWithProfile } from '@api/user/repositories/staff.repository';
import { UserService } from '@api/user/services/user.service';
import { StaffService } from '@api/user/services/staff.service';
import { AgentService } from '@api/user/services/agent.service';
import { CustomerService } from '@api/user/services/customer.service';
import { TokenType } from '@modules/security/security.interface';
import { PrismaService } from '@database/prisma.service';
import { JwtPayloadData, AnyUser } from '@common/interfaces';
import { AccountType } from '@common/enums';
import { JWT_EXPIRES_IN } from '@common/constants';
import { validatePassword } from '@common/utils/password';
import ExcludeProperty from '@common/utils/exclude-property';
import { CustomerWithProfile } from '@api/user/repositories/customer.repository';

@Injectable()
export class AuthenticationService {
  private readonly MAX_LOGIN_ATTEMPTS = 3;
  private readonly LOGIN_BLOCK_TIME_MINUTES = 2;

  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly staffService: StaffService,
    private readonly agentService: AgentService,
    private readonly customerService: CustomerService,
    private readonly hashingService: HashingService,
    private readonly securityService: SecurityService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  public async loginAgent(email: string, password: string) {
    const loginAttemptsKey = `login_attempts_${email}`;
    const blockedKey = `login_blocked_${email}`;
  
    const isBlocked = await this.cacheManager.get(blockedKey);
    if (isBlocked) {
      throw new BadRequestException([
        'You have been blocked from logging in for 30 minutes due to multiple failed attempts',
      ]);
    }
  
    const user = (await this.agentService.deepFind({
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
    })) as AgentWithProfile;
  
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

  public async loginCustomer(email: string, password: string) {
    const loginAttemptsKey = `login_attempts_${email}`;
    const blockedKey = `login_blocked_${email}`;
  
    const isBlocked = await this.cacheManager.get(blockedKey);
    if (isBlocked) {
      throw new BadRequestException([
        'You have been blocked from logging in for 30 minutes due to multiple failed attempts',
      ]);
    }
  
    const user = (await this.customerService.deepFind({
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
    })) as CustomerWithProfile;
  
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

  public async registerAgent(
    email: string,
    phone: string,
    password: string,
  ) {
    if (validatePassword(password) === false) {
      throw new BadRequestException([
        'Password must be at least 8 characters long, contain at least \
one uppercase letter, one lowercase letter, one number, one special character and no spaces',
      ]);
    }

    if (email && (await this.agentService.findByEmail(email))) {
      throw new BadRequestException(['Email already exists']);
    }

    if (!phone.startsWith('+')) {
      throw new BadRequestException([
        'Phone number must be in international format',
      ]);
    }

    const currentUser = await this.agentService.findByPhone(phone);
    if (currentUser) {
      throw new BadRequestException(['Phone number already exists']);
    }

    const hashedPassword = await this.hashingService.hash(password);
    const agentCode = await this.generateUniqueAgentCode();

    const newAgent = await this.agentService.create({
        agentCode,
        email,
        phone,
      password: hashedPassword,
      phoneVerified: true,
      profile: {
        create: {
        }
      },
      kyc: {
        create: {
        }
      }
    },
    );

    return newAgent;
  }

  public async registerCustomer(
    email: string,
    phone: string,
    password: string,
  ) {

    if (validatePassword(password) === false) {
      throw new BadRequestException([
        'Password must be at least 8 characters long, contain at least \
one uppercase letter, one lowercase letter, one number, one special character and no spaces',
      ]);
    }

    if (email && (await this.customerService.findByEmail(email))) {
      throw new BadRequestException(['Email already exists']);
    }

    if (!phone.startsWith('+')) {
      throw new BadRequestException([
        'Phone number must be in international format',
      ]);
    }

    const currentUser = await this.customerService.findByPhone(phone);
    if (currentUser) {
      throw new BadRequestException(['Phone number already exists']);
    }

    const hashedPassword = await this.hashingService.hash(password);

    const newCustomer = await this.customerService.create({
        email,
        phone,
        password: hashedPassword,
        phoneVerified: true,
      },
    );

    return newCustomer;
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

  


  private async generateUniqueAgentCode(): Promise<string> {
    let code: string;
    let exists = true;

    while (exists) {
      code = `AG${Math.floor(100000 + Math.random() * 900000)}`;
      const agent = await this.prisma.agent.findFirst({
        where: { agentCode: code },
      });
      exists = !!agent;
    }

    return code;
  }


}