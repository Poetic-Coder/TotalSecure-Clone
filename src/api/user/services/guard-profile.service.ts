import ExcludeProperty from '@common/utils/exclude-property';
import { getRandomString } from '@common/utils/general';
import { HashingService } from '@modules/hashing/hashing.service';
import { BadRequestException, ConflictException, Injectable, Logger } from '@nestjs/common';
import {
  Prisma,
  VerificationStatus,
  Gender,
} from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { CloudinaryService } from '@modules/cloudinary/cloudinary.service';
import { GuardProfileRepository } from '../repositories/guard-profile.repository';


@Injectable()
export class GuardProfileService {
  private logger = new Logger(GuardProfileService.name);

  constructor(
    private readonly profileRepository: GuardProfileRepository,
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

  public async uploadImage(url: string, guardId: string) {
    return this.update({
      where: {
        guardId,
      },
      data: {
        photo: url,
      },
    });
  }


  public async create(data: Prisma.GuardProfileCreateInput) {
    return this.profileRepository.create({ data });
  }

  public async update(params: Prisma.GuardProfileUpdateArgs) {
    return this.profileRepository.update(params);
  }

  public async getById(id: string) {
    return this.profileRepository.findById(id);
  }

  public async findFirst(params: Prisma.GuardProfileFindFirstArgs) {

    return this.profileRepository.find(params);
  }

  public async findMany(params: Prisma.GuardProfileFindManyArgs) {

    return this.profileRepository.findMany(params);
  }

  public async getByGuardId(guardId: string) {
    return this.findFirst({ where: { guardId } });
  }

  
  public async guardProfile(guardId: string) {
    const profile = await this.profileRepository.find({ where: { guardId } });
    if (!profile) {
      throw new BadRequestException(['Invalid guard']);
    }
    return ExcludeProperty(profile, ['pk']);
  }

  

  /**
   * Updates the user's bio with the provided data
   *
   * @param guard guard's id
   * @param firstName First name
   * @param lastName Last name
   * @returns Profile
   */
  public async updateBio(
    guardId: string,
    firstName: string,
    lastName: string,
  ) {
    // Check if username is unique

    const existingProfile = await this.profileRepository.find({
      where: { guardId },
    });
    if (existingProfile && existingProfile.guardId !== guardId) {
      throw new BadRequestException(['This guardId is not available']);
    }

    let profile = await this.profileRepository.update({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      },
      where: {
        guardId,
      },
    });


      profile = await this.profileRepository.update({
        data: {
         
        },
        where: {
          guardId,
        },
      });

    return ExcludeProperty(profile, ['pk']);
  }

 

  public async uploadPhoto(guardId: string, photo: string) {
    const profile = await this.profileRepository.update({
      data: {
        photo,
      },
      where: {
        guardId,
      },
    });
    await this.profileRepository.update({
          where: {
            guardId,
          },
          data: {
          },
        });
    return ExcludeProperty(profile, ['pk']);
  }

 

}