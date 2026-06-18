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
import { StaffRepository } from '@api/user/repositories/staff.repository';
import { Prisma, Staff } from '@prisma/client';
import { ChangePasswordDto } from '../dtos/register.dto';
import { CryptoService, HashingService } from '@modules/hashing/hashing.service';
import ExcludeProperty from '@common/utils/exclude-property';

@Injectable()
export class StaffService {
  constructor(
    private readonly repository: StaffRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly hashingService: HashingService,
    private readonly configService: ConfigService,
    private readonly cryptoService: CryptoService,
) {}

private readonly logger = new Logger(StaffService.name);

  public async create(data: Prisma.StaffCreateInput) {
    return this.repository.create({ data });
  }

  public async findById(id: string) {
    const staff = await this.repository.findById(id);
    if (!staff) throw new NotFoundException(`Staff with ID ${id} not found.`);
    return staff;
  }

  public async findByEmail(email: string) {
    return this.repository.find({ where: { email } });
  }

  public async findByPhone(phone: string) {
    return this.repository.find({ where: { phone } });
  }

  public async deepFind(data: Prisma.StaffFindFirstArgs) {
    return this.repository.find(data);
  }

  public async findByEmployeeId(employeeId: string) {
    return this.repository.find({ where: { employeeId } });
  }

  public async findAll() {
    return this.repository.findMany({});
  }

  public async update(params: Prisma.StaffUpdateArgs) {
    return this.repository.update(params);
  }

  public async changePassword(data: ChangePasswordDto, user: Staff) {
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

  public async setPassword(user: Staff, password: string) {
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
  
  public async deleteStaffById(id: string) {
    return this.repository.delete({ where: { id } });
  }

  public async findByApiKey(apiKey: string) {
    return this.repository.find({ where: { apiKeys: { some: { key: apiKey } } }, include: { profile: true } });
  }

}