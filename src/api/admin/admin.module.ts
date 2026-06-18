import { Module } from '@nestjs/common';
import { AgentService } from './agent/agent.service';
import { AgentController } from './agent/agent.controller';
import { PrismaService } from '@database/prisma.service';
import { AgentRepository } from '@api/user/repositories/agent.repository';
import { MoolaClient } from '@modules/clients/clients/moola/moola';
import { AgentProfileRepository } from '@api/user/repositories/agent-profile.repository';
import { SecurityModule } from '@modules/security/security.module';
import { BookingService } from './booking/booking.service';
import { BookingController } from './booking/booking.controller';


@Module({
  imports: [SecurityModule,],
  providers: [AgentService, PrismaService, AgentRepository, MoolaClient, AgentProfileRepository, BookingService],
  controllers: [AgentController, BookingController]
})
export class AdminModule {}
