import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { Staff } from '@prisma/client';
import { ChangePasswordDto } from '../dtos/change-password.dto';
import { HashingService } from '@modules/hashing/hashing.service';
import ExcludeProperty from '@common/utils/exclude-property';
import { StaffRepository } from '../repositories/staff.repository';

@Injectable()
export class StaffService {
  constructor(
    private readonly repository: StaffRepository,
    private readonly hashingService: HashingService,
  ) {}

  public async changePassword(data: ChangePasswordDto, user: Staff) {
    const { newPassword, currentPassword } = data;

    if (!(await this.hashingService.compare(currentPassword, user.password))) {
      throw new BadRequestException(['Current password is incorrect']);
    }

    const password = await this.hashingService.hash(newPassword);
    const updated = await this.repository.update({
      data: { password },
      where: { id: user.id },
      include: { profile: true },
    });
    return ExcludeProperty(updated, ['password']);
  }
}
