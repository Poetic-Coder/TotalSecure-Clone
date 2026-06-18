import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { DatabaseModule } from '@database/database.module';
import { BookingRepository } from './booking.repository';
import { PrismaService } from '@database/prisma.service';
import { SecurityModule } from '@modules/security/security.module';
import { AmadeusClient } from '@modules/clients/clients/amadeus/amadeus';
import { UserModule } from '@api/user/user.module';

@Module({
  imports: [DatabaseModule, SecurityModule, UserModule],
  controllers: [BookingController],
  providers: [BookingService, BookingRepository, PrismaService, AmadeusClient],
  exports: [BookingService,], 

})
export class BookingModule {}