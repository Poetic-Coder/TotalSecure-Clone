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
import { AgentRepository } from '@api/user/repositories/agent.repository';
import { Prisma, Agent, Staff } from '@prisma/client';
import { ChangePasswordDto } from '../dtos/register.dto';
import { CryptoService, HashingService } from '@modules/hashing/hashing.service';
import ExcludeProperty from '@common/utils/exclude-property';

@Injectable()
export class AgentService { 
  constructor(
    private readonly repository: AgentRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly hashingService: HashingService,
    private readonly configService: ConfigService,
    private readonly cryptoService: CryptoService,
) {}

private readonly logger = new Logger(AgentService.name);

  public async create(data: Prisma.AgentCreateInput) {
    return this.repository.create({ data });
  }

  public async findById(id: string) {
    const agent = await this.repository.findById(id);
    if (!agent) throw new NotFoundException(`Agent with ID ${id} not found.`);
    return agent;
  }

  public async findByEmail(email: string) {
    return this.repository.find({ where: { email } });
  }

  public async findByAgentCode(agentCode: string) {
    return this.repository.find({ where: { agentCode } });
  }

  public async findByPhone(phone: string) {
    return this.repository.find({ where: { phone } });
  }

  public async findByApiKey(apiKey: string) {
    return this.repository.find({ where: { apiKeys: { some: { key: apiKey } } }, include: { profile: true } });
  }

  public async deepFind(data: Prisma.AgentFindFirstArgs) {
    return this.repository.find(data);
  }

  public async findAll() {
    return this.repository.findMany({});
  }

  public async update(params: Prisma.AgentUpdateArgs) {
    return this.repository.update(params);
  }

  public async changePassword(data: ChangePasswordDto, user: Agent) {
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

  public async deleteAgentById(id: string) {
    return this.repository.delete({ where: { id } });
  }
}