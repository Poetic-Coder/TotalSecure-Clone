import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HashingService, HmacService } from './hashing.service';

@Module({
  imports: [ConfigModule],
  providers: [HashingService, HmacService],
  exports: [HashingService, HmacService],
})
export class HashingModule {}
