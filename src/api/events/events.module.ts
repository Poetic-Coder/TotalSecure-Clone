import { Module, forwardRef } from '@nestjs/common';
import { HashingModule } from '@modules/hashing/hashing.module';
import { EventService } from './services/events.service';
//import { EventRepository } from './repositories/event.repository';
import { EventController } from './event.controller';
import { BackgroundModule } from '@modules/background/background.module';
import { DatabaseModule } from '@database/database.module';

@Module({
  imports: [HashingModule, forwardRef(() => BackgroundModule), DatabaseModule],
  providers: [EventService],
  controllers: [EventController],
  exports: [EventService],
})
export class EventModule {}
