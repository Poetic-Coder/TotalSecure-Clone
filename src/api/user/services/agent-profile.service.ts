import ExcludeProperty from '@common/utils/exclude-property';
import { getRandomString } from '@common/utils/general';
import { HashingService } from '@modules/hashing/hashing.service';
import { BadRequestException, ConflictException, Injectable, Logger } from '@nestjs/common';
import {
  Prisma,
  VerificationStatus,
  Gender,
} from '@prisma/client';
import { AgentProfileRepository } from '../repositories/agent-profile.repository';
import { ConfigService } from '@nestjs/config';
import { CloudinaryService } from '@modules/cloudinary/cloudinary.service';


@Injectable()
export class AgentProfileService {
  private logger = new Logger(AgentProfileService.name);

  constructor(
    private readonly profileRepository: AgentProfileRepository,
    private readonly hashingService: HashingService,
    private readonly configService: ConfigService,
    private readonly cloudinaryService: CloudinaryService,

  ) {}

  public async uploadBase64Image(base64Image: string) {
    const result = await this.cloudinaryService.uploadFileFromBase64(
      base64Image,
    );
    if (result.secure_url) {
      return result.secure_url;
    }
    throw new BadRequestException(['Unable to upload image']);
  }

  public async uploadApplicationLetter(base64Pdf: string): Promise<string> {
    const dataUri = `data:application/pdf;base64,${base64Pdf}`;

    const result = await this.cloudinaryService.uploadRawFileFromBase64(dataUri);

    if (result && result.secure_url) {
      return result.secure_url;
    }
    
    this.logger.error('Cloudinary upload failed for application letter.', result);
    throw new BadRequestException('Unable to upload application letter PDF.');
  }

  public async uploadImage(url: string, agentId: string) {
    return this.update({
      where: {
        agentId,
      },
      data: {
        photo: url,
      },
    });
  }


  public async create(data: Prisma.AgentProfileCreateInput) {
    return this.profileRepository.create({ data });
  }

  public async update(params: Prisma.AgentProfileUpdateArgs) {
    return this.profileRepository.update(params);
  }

  public async getById(id: string) {
    return this.profileRepository.findById(id);
  }

  public async findFirst(params: Prisma.AgentProfileFindFirstArgs) {    

    return this.profileRepository.find(params);
  }

  public async findMany(params: Prisma.AgentProfileFindManyArgs) {

    return this.profileRepository.findMany(params);
  }

  public async getByAgentId(agentId: string) {
    return this.findFirst({ where: { agentId } });
  }

  
  public async agentProfile(agentId: string) {
    const profile = await this.profileRepository.find({ where: { agentId } });
    if (!profile) {
      throw new BadRequestException(['Invalid user']);
    }
    return ExcludeProperty(profile, ['pk']);
  }

  

  /**
   * Updates the user's bio with the provided data
   *
   * @param agentId Agent's id
   * @param firstName First name
   * @param lastName Last name
   * @returns Profile
   */
  public async updateBio(
    agentId: string,
    firstName: string,
    lastName: string,
  ) {
    // Check if username is unique

    const existingProfile = await this.profileRepository.find({
      where: { agentId },
    });
    if (existingProfile && existingProfile.agentId !== agentId) {
      throw new BadRequestException(['This agentId is not available']);
    }

    let profile = await this.profileRepository.update({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      },
      where: {
        agentId,
      },
    });


      profile = await this.profileRepository.update({
        data: {
         
        },
        where: {
          agentId,
        },
      });

    return ExcludeProperty(profile, ['pk']);
  }

 

  public async uploadPhoto(agentId: string, photo: string) {
    const profile = await this.profileRepository.update({
      data: {
        photo,
      },
      where: {
        agentId,
      },
    });
    await this.profileRepository.update({
          where: {
            agentId,  
          },
          data: {
          },
        });
    return ExcludeProperty(profile, ['pk']);
  }

 

}