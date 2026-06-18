import {
  BadRequestException,
  Injectable,
  Logger,
  Inject,
  forwardRef,
  ConflictException,
} from '@nestjs/common';
import {
  AgentSetupStage,
  IdentificationCardType,
  Prisma,
  VerificationStatus,
} from '@prisma/client';
import { CacVerifcationDto, IdentificationDto, UpdateAgentKycDto, updateAgentProfileDto, uploadSignatureDto } from './dtos/kyc.dto';
import { IdKycMapType } from './interfaces/kyc';
import { ConfigService } from '@nestjs/config';
import { APP_ENV } from '@common/interfaces';
import { AgentProfileService } from '@api/user/services/agent-profile.service';
import { AgentService } from '@api/user/services/agent.service';
import { AgentWithProfile } from '@api/user/repositories/agent.repository';
import { VirtualSwitchAIService } from '@modules/clients/clients/ai/virtualSwitchAi';
import { BvnVerification, verifyIdentification } from '@common/utils/kyc';
import { VerifyMeClient } from '@modules/clients/clients/verifyMe/verifyMe';
import { YouVerifyService } from '@modules/clients/clients/youVerify/youVerify';
import { AgentProfileRepository } from '@api/user/repositories/agent-profile.repository';
import { verifyCacRegistration } from '@common/utils/kyc';
import { constants } from 'node:buffer';

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);

  constructor(
    @Inject(forwardRef(() => AgentService))
    private readonly userService: AgentService,
    @Inject(forwardRef(() => AgentProfileService))
    private readonly profileService: AgentProfileService,
    private readonly configService: ConfigService,
    private readonly aiService: VirtualSwitchAIService,
    private readonly youVerify: YouVerifyService,
    private readonly verifyMe: VerifyMeClient,
    private readonly agentProfileRepo: AgentProfileRepository,
  ) { }

  public async verifyId(userId: string, data: IdentificationDto) {
    const { idNumber, idType, idImageURl } = data;

    const aiVerifiedId = await this.aiService.verifyIdDoc({
      file_url: idImageURl,
      id_number: idNumber,
      id_type: idType === 'NATIONAL_ID' ? 'NIN' : idType,
    });

    if (!aiVerifiedId.id_number_match) {
      throw new BadRequestException('ID number does not match the uploaded document');
    }

    const user = (await this.userService.findById(
      userId,
    )) as AgentWithProfile;
    if (!user) throw new BadRequestException('User not found');

    const profile = user.profile;

    const NODE_ENV = this.configService.get<APP_ENV>('NODE_ENV');
    const KYC_PROVIDER = this.configService.get('KYC_PROVIDER')

    const dataV = {
      idNumber,
      firstName: profile.firstName,
      lastName: profile.lastName,
      dob: profile.dob || data.dob,
      phone: user.phone,
    };

    const response = await verifyIdentification(
      NODE_ENV,
      KYC_PROVIDER,
      idType,
      this.verifyMe,
      this.youVerify,
      dataV
    );

    if (!response.verified) throw new BadRequestException('Unable to verify ID', response);

    await this.agentProfileRepo.updateAgentKyc({
      where: {
        agentPk_agentId: {
          agentPk: user.pk,
          agentId: userId,
        },
      },
      data: {
        idType: idType as any,
        idNumber,
        idImageUrl: idImageURl,
        idVerified: 'APPROVED',
        rawIdData: { data: response.data as any as Prisma.InputJsonValue },
        updatedAt: new Date(),
        regStage: AgentSetupStage.OWNER_ID_VERIFICATION
      },
    });

    return { message: 'ID verification successful'};
  }

  public async verifyCac(userId: string, data: CacVerifcationDto) {
    const NODE_ENV = this.configService.get<APP_ENV>('NODE_ENV');
    const KYC_PROVIDER = this.configService.get('KYC_PROVIDER');

    const user = (await this.userService.findById(userId)) as AgentWithProfile;
    if (!user) throw new BadRequestException('User not found');

    const response = await verifyCacRegistration(
      NODE_ENV,
      KYC_PROVIDER,
      data.regNumber,
      this.youVerify,
      this.verifyMe,
    );

    if (!response?.verified) throw new BadRequestException('Unable to verify CAC registration', response);

    await this.agentProfileRepo.updateAgentKyc({
      where: {
        agentPk_agentId: { agentPk: user.pk, agentId: user.id },
      },
      data: {
        name: response.data?.name,
        address: response.data?.headOfficeAddress,
        state: response.data?.state,
        city: response.data?.city,
        lga: response.data?.lga,
        cacImageUrl: data.image,
        cacNumber: data.regNumber,
        cacVerified: 'APPROVED',
        rawCacData: { data: response.data as any as Prisma.InputJsonValue },
        updatedAt: new Date(),
        regStage: AgentSetupStage.AGENT_ID_VERIFICATION
      },
    });

    return {
      message: 'CAC verification successful',
      businessInformation: {
        businessName: response.data.name,
        address: response?.data?.headOfficeAddress,
        state: response?.data?.state,
        city: response?.data?.city,
        lga: response?.data?.lga,
        boardOfDirectors: response?.data?.keyPersonnel,
      },
    };
  }

  public async verifyBvn(bvn: string, userId: string) {
    const NODE_ENV = this.configService.get<APP_ENV>('NODE_ENV');
    const KYC_PROVIDER = this.configService.get<string>('KYC_PROVIDER');

    const user = (await this.userService.findById(userId)) as AgentWithProfile;
    if (!user) throw new BadRequestException('User not found');

    const existingKyc = await this.agentProfileRepo.findAgentKyc({ where: { bvn } });
    if (existingKyc) throw new BadRequestException('An agent with this BVN already exists');

    const response = await BvnVerification(
      NODE_ENV,
      KYC_PROVIDER,
      bvn,
      user,
      this.youVerify,
      this.verifyMe,
    );

    const isValid = response?.verified || response?.success === true;
    if (!isValid) {
      throw new BadRequestException('BVN verification failed. Please check and try again.');
    }

    await this.agentProfileRepo.updateAgentKyc({
      where: { agentPk_agentId: { agentPk: user.pk, agentId: user.id } },
      data: {
        bvn,
        bvnVerified: 'APPROVED',
        rawBvnData: { data: response.data as Prisma.InputJsonValue },
        updatedAt: new Date(),
        regStage: AgentSetupStage.BVN_VERIFICATION
      },
    });

    return {
      success: true,
      message: `BVN verification Successfull`
    }
  }

  public async updateAgentProfile(userId: string, data: updateAgentProfileDto) {
    const user = (await this.userService.findById(userId)) as AgentWithProfile;
    if (!user) throw new BadRequestException('User not found');

    return this.agentProfileRepo.update({
      where: {
        agentPk_agentId: {
          agentId: user.id,
          agentPk: user.pk,
        },
      },
      data,
    });
  }

  public async updateAgentKyc(userId: string, data: UpdateAgentKycDto) {
    const user = (await this.userService.findById(userId)) as AgentWithProfile;
    if (!user) throw new BadRequestException('User not found');

    return this.agentProfileRepo.updateAgentKyc({
      where: {
        agentPk_agentId: {
          agentId: user.id,
          agentPk: user.pk,
        },
      },
      data,
    });
  }
}