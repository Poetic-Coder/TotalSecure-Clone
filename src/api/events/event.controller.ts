import { ApiHeaders } from '@common/decorators/defaultHeaders';
import { Controller, Get, HttpCode, HttpStatus, Param, Req } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { EventService } from './services/events.service';
import { WebhookEventDto } from './dtos/event.dto';

@ApiTags('Events')
@Controller('events')
@ApiHeaders()
export class EventController {

  constructor (
    private readonly eventService: EventService,
  ) {}

  // @Get()
  // @ApiOkResponse({
  //   description: 'Get all events',
  //   type: [WebhookEventDto],
  // })
  //@HttpCode(HttpStatus.OK)
  //public async getAllEvents() {
  //  return this.eventService.all();
  //} 

  // @Get('by-workspace/:workspaceId')
  // @ApiOkResponse({
  //   description: 'Get all events for a workspace',
  //   type: [WebhookEventDto],
  // })
  //@HttpCode(HttpStatus.OK)
  //public async getEventsByWorkspace(
  //  @Param('workspaceId') workspaceId: string
  //) {
  //  return this.eventService.getWorkspaceEvents(workspaceId);
  //}

}
