import {
  BadRequestException,
  NotFoundException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { generateOtp } from '@common/utils/otp';
import { Cache } from 'cache-manager';
import { SmsService } from '@modules/network/services/sms/sms.service';
import { OTP_EXPIRY } from '@common/constants';
import { ConfigService } from '@nestjs/config';
import { APP_ENV } from '@common/interfaces';
import { EmailService } from '@modules/network/services/email/email.service';
import { CustomerRepository } from '@api/user/repositories/customer.repository';
import { Customer, Prisma } from '@prisma/client';
import { ChangePasswordDto } from '../dtos/register.dto';
import { CryptoService, HashingService } from '@modules/hashing/hashing.service';
import ExcludeProperty from '@common/utils/exclude-property';

@Injectable()
export class CustomerService {
  constructor(
    private readonly repository: CustomerRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly hashingService: HashingService,
    private readonly configService: ConfigService,
    private readonly cryptoService: CryptoService,
) {}

private readonly logger = new Logger(CustomerService.name);

  public async create(data: Prisma.CustomerCreateInput) {
    return this.repository.create({ data });
  }

  public async findById(id: string) {
    const customer = await this.repository.findById(id);
    if (!customer) throw new NotFoundException(`Customer with ID ${id} not found.`);
    return customer;
  }

  public async findByEmail(email: string) {
    return this.repository.find({ where: { email } });
  }

  public async findByPhone(phone: string) {
    return this.repository.find({ where: { phone } });
  }

  public async findAll() {
    return this.repository.findMany({});
  }

  public async deepFind(data: Prisma.CustomerFindFirstArgs) {
    return this.repository.find(data);
  }

  public async update(params: Prisma.CustomerUpdateArgs) {
    return this.repository.update(params);
  }

  public async changePassword(data: ChangePasswordDto, user: Customer) {
    const { newPassword, currentPassword } = data;

    if (!(await this.hashingService.compare(currentPassword, user.password))) {
      throw new BadRequestException(['Current password is incorrect']);
    }

    const password = await this.hashingService.hash(newPassword);
    user = await this.repository.update({
      data: { password },
      where: { id: user.id },
      include: { profile: true },
    });
    return ExcludeProperty(user, ['password']);
  }
  
  public async setPassword(user: Customer, password: string) {
    const hashedPassword = await this.hashingService.hash(password);
    return this.repository.update({
      data: { password: hashedPassword },
      where: { id: user.id },
    });
  }

  public async setPhoneVerified(id: string) {
    return this.repository.update({
      data: { phoneVerified: true },
      where: { id },
    });
  }

  public async setEmailVerified(id: string) {
    return this.repository.update({
      data: { emailVerified: true },
      where: { id },
    });
  }

  
  public async deleteCustomerById(id: string) {
    return this.repository.delete({ where: { id } });
  }

  public async findByApiKey(apiKey: string) {
    return this.repository.find({ where: { apiKeys: { some: { key: apiKey } } }, include: { profile: true } });
  }
}