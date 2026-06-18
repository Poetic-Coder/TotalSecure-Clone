import ExcludeProperty from '@common/utils/exclude-property';
import { getRandomString } from '@common/utils/general';
import { HashingService } from '@modules/hashing/hashing.service';
import { BadRequestException, ConflictException, Injectable, Logger } from '@nestjs/common';
import {
  Prisma,
  VerificationStatus,
  Gender,
} from '@prisma/client';
import { StaffProfileRepository } from '../repositories/staff-profile.repository';
import { ConfigService } from '@nestjs/config';
import { CloudinaryService } from '@modules/cloudinary/cloudinary.service';


@Injectable()
export class ProfileService {
  private logger = new Logger(ProfileService.name);

  constructor(
    private readonly profileRepository: StaffProfileRepository,
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

  public async uploadImage(url: string, staffId: string) {
    return this.update({
      where: {
        staffId,
      },
      data: {
        photo: url,
      },
    });
  }


  public async create(data: Prisma.StaffProfileCreateInput) {
    return this.profileRepository.create({ data });
  }

  public async update(params: Prisma.StaffProfileUpdateArgs) {
    return this.profileRepository.update(params);
  }

  public async getById(id: string) {
    return this.profileRepository.findById(id);
  }

  public async findFirst(params: Prisma.StaffProfileFindFirstArgs) {

    return this.profileRepository.find(params);
  }

  public async findMany(params: Prisma.StaffProfileFindManyArgs) {

    return this.profileRepository.findMany(params);
  }

  public async getByStaffId(staffId: string) {
    return this.findFirst({ where: { staffId } });
  }

  
  public async staffProfile(staffId: string) {
    const profile = await this.profileRepository.find({ where: { staffId } });
    if (!profile) {
      throw new BadRequestException(['Invalid user']);
    }
    return ExcludeProperty(profile, ['pk']);
  }

  

  /**
   * Updates the user's bio with the provided data
   *
   * @param staffId Staff's id
   * @param firstName First name
   * @param lastName Last name
   * @returns Profile
   */
  public async updateBio(
    staffId: string,
    firstName: string,
    lastName: string,
  ) {
    // Check if username is unique

    const existingProfile = await this.profileRepository.find({
      where: { staffId },
    });
    if (existingProfile && existingProfile.staffId !== staffId) {
      throw new BadRequestException(['This staffId is not available']);
    }

    let profile = await this.profileRepository.update({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      },
      where: {
        staffId,
      },
    });


      profile = await this.profileRepository.update({
        data: {
         
        },
        where: {
          staffId,
        },
      });

    return ExcludeProperty(profile, ['pk']);
  }

 

  public async uploadPhoto(staffId: string, photo: string) {
    const profile = await this.profileRepository.update({
      data: {
        photo,
      },
      where: {
        staffId,
      },
    });
    await this.profileRepository.update({
          where: {
            staffId,
          },
          data: {
          },
        });
    return ExcludeProperty(profile, ['pk']);
  }

 

}