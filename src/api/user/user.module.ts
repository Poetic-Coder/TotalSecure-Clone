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
import { AgentController } from './controllers/agent.controller';
import { UserService } from './services/user.service';
import { AgentService } from './services/agent.service';
import { StaffService } from './services/staff.service';
import { CustomerService } from './services/customer.service';
import { AgentRepository } from './repositories/agent.repository';
import { StaffRepository } from './repositories/staff.repository';
import { CustomerRepository } from './repositories/customer.repository';
import { AgentProfileService } from './services/agent-profile.service';
import { AgentProfileRepository } from './repositories/agent-profile.repository';
import { SecurityModule } from '@modules/security/security.module'; 




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
  controllers: [ FileController, AgentController],
  providers: [
    UserService,
    AgentService,
    StaffService,
    CustomerService,
    AgentProfileService,
    AgentRepository,
    StaffRepository,
    CustomerRepository,
    AgentProfileRepository,
    CryptoService,
  ],
  exports: [UserService, AgentService, StaffService, CustomerService, AgentProfileService, AgentRepository, StaffRepository, CustomerRepository, AgentProfileRepository],




})
export class UserModule {}
