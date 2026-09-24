import ExcludeProperty from '@common/utils/exclude-property';
import { BadRequestException, Injectable } from '@nestjs/common';
import { StaffProfileRepository } from '../repositories/staff-profile.repository';

@Injectable()
export class ProfileService {
  constructor(private readonly profileRepository: StaffProfileRepository) {}

  public async staffProfile(staffId: string) {
    const profile = await this.profileRepository.find({ where: { staffId } });
    if (!profile) {
      throw new BadRequestException(['Invalid user']);
    }
    return ExcludeProperty(profile, ['pk']);
  }

  public async updateBio(staffId: string, firstName: string, lastName: string) {
    const existingProfile = await this.profileRepository.find({
      where: { staffId },
    });
    if (!existingProfile) {
      throw new BadRequestException(['Profile not found']);
    }

    const profile = await this.profileRepository.update({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      },
      where: { staffId },
    });

    return ExcludeProperty(profile, ['pk']);
  }

  public async uploadPhoto(staffId: string, photo: string) {
    const profile = await this.profileRepository.update({
      data: { photo },
      where: { staffId },
    });
    return ExcludeProperty(profile, ['pk']);
  }
}
