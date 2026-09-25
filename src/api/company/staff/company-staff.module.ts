import { Module } from '@nestjs/common';
import { DatabaseModule } from '@database/database.module';
import { HashingModule } from '@modules/hashing/hashing.module';
import { StaffController } from './controllers/staff.controller';
import { StaffService } from './services/staff.service';
import { ProfileService } from './services/staff-profile.service';
import { StaffRepository } from './repositories/staff.repository';
import { StaffProfileRepository } from './repositories/staff-profile.repository';
import { SecurityModule } from '@modules/security/security.module';
import { CommonAuthModule } from '@api/common/auth/common-auth.module';

@Module({
  imports: [DatabaseModule, HashingModule, SecurityModule, CommonAuthModule],
  controllers: [StaffController],
  providers: [
    StaffService,
    ProfileService,
    StaffRepository,
    StaffProfileRepository,
  ],
})
export class CompanyStaffModule {}
