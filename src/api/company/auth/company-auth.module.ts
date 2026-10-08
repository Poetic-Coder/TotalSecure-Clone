import { Module } from '@nestjs/common';
import { CommonAuthModule } from '@api/common/auth/common-auth.module';
import { CompanyAuthController } from './company-auth.controller';

@Module({
  imports: [CommonAuthModule],
  controllers: [CompanyAuthController],
})
export class CompanyAuthModule {}
