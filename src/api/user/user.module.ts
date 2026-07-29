import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from '@database/database.module';
import { HashingModule } from '@modules/hashing/hashing.module';
import { CoreModule } from 'src/core/core.module';
import { CloudinaryModule } from '@modules/cloudinary/cloudinary.module'
import { ApiClientModule } from '@modules/clients/clients.module';
import { BackgroundModule } from '@modules/background/background.module';
import { ConfigModule } from '@nestjs/config';
import { FileController } from './controllers/file.controller';
import { KycModule } from '@api/kyc/kyc.module';
import { CryptoService } from '@modules/hashing/hashing.service';
import { UserService } from './services/user.service';
import { StaffService } from './services/staff.service';
import { SecurityModule } from '@modules/security/security.module'; 
import { StaffRepository } from './repositories/staff.repository'




@Module({
  imports: [
    DatabaseModule,
    CoreModule,
    HashingModule,
    CloudinaryModule,
    forwardRef(() => ApiClientModule),
    BackgroundModule,
    ConfigModule,
    forwardRef(() => KycModule),
    SecurityModule,
  ],
  controllers: [ FileController],
  providers: [
    UserService,
    StaffService,
    CryptoService,
    StaffRepository
  ],
  exports: [UserService, StaffService, StaffRepository],




})
export class UserModule {}
