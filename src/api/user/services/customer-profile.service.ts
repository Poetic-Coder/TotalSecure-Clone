import ExcludeProperty from '@common/utils/exclude-property';
import { getRandomString } from '@common/utils/general';
import { HashingService } from '@modules/hashing/hashing.service';
import { BadRequestException, ConflictException, Injectable, Logger } from '@nestjs/common';
import {
  Prisma,
  VerificationStatus,
  Gender,
} from '@prisma/client';
import { CustomerProfileRepository } from '../repositories/customer-profile.repository';
import { ConfigService } from '@nestjs/config';
import { CloudinaryService } from '@modules/cloudinary/cloudinary.service';


@Injectable()
export class CustomerProfileService {

  private logger = new Logger(CustomerProfileService.name);

  constructor(
    private readonly profileRepository: CustomerProfileRepository,      
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

  public async uploadImage(url: string, customerId: string) {
    return this.update({
      where: {
        customerId,
      },
      data: {
        photo: url,
      },
    });
  }


  public async create(data: Prisma.CustomerProfileCreateInput) {
    return this.profileRepository.create({ data });
  }

  public async update(params: Prisma.CustomerProfileUpdateArgs) {
    return this.profileRepository.update(params);
  }

  public async getById(id: string) {
    return this.profileRepository.findById(id);
  }

  public async findFirst(params: Prisma.CustomerProfileFindFirstArgs) {

    return this.profileRepository.find(params);
  }

  public async findMany(params: Prisma.CustomerProfileFindManyArgs) {

    return this.profileRepository.findMany(params);
  }

  public async getByCustomerId(customerId: string) {
    return this.findFirst({ where: { customerId } });
  }

  
  public async customerProfile(customerId: string) {
    const profile = await this.profileRepository.find({ where: { customerId } });
    if (!profile) {
      throw new BadRequestException(['Invalid user']);
    }
    return ExcludeProperty(profile, ['pk']);
  }

  

  /**
   * Updates the user's bio with the provided data
   *
   * @param customerId Customer's id
   * @param firstName First name
   * @param lastName Last name
   * @returns Profile
   */
  public async updateBio(
    customerId: string,
    firstName: string,
    lastName: string,
  ) {
    // Check if username is unique

    const existingProfile = await this.profileRepository.find({
      where: { customerId },
    });
    if (existingProfile && existingProfile.customerId !== customerId) {
      throw new BadRequestException(['This customerId is not available']);
    }

    let profile = await this.profileRepository.update({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      },
      where: {
        customerId,
      },
    });


      profile = await this.profileRepository.update({
        data: {
         
        },
        where: {
          customerId,
        },
      });

    return ExcludeProperty(profile, ['pk']);
  }

 

  public async uploadPhoto(customerId: string, photo: string) {
    const profile = await this.profileRepository.update({
      data: {
        photo,
      },
      where: {
        customerId,
      },
    });
    await this.profileRepository.update({
          where: {
            customerId,
          },
          data: {
          },
        });
    return ExcludeProperty(profile, ['pk']);
  }

 

}