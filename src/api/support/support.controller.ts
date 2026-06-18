import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupportService } from './support.service';
import { createTicketDTO, supportLoginDTO, replyTicketDTO  } from '@modules/clients/clients/interfaces/helpAndSupport/support.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUserInterceptor } from '@common/interceptors/authenticated-account.interceptor';
import { CurrentUser } from '@common/decorators/current-user';
import { Staff } from '@prisma/client';
import { ApiHeaders } from '@common/decorators/defaultHeaders';


@ApiTags('support')
@Controller('support')
@ApiHeaders()
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @ApiBearerAuth()
  @UseInterceptors(AuthUserInterceptor)
  @Post('login')
  @ApiBody({
      description: 'login to support and get auth token used to query other endpoints',
      type: supportLoginDTO,
    })
  async login( @CurrentUser() user: Staff,  @Body() data: supportLoginDTO) {
    return this.supportService.login(data);
  }

  @ApiBearerAuth()
  @UseInterceptors(AuthUserInterceptor)
  @Post('create-support-ticket')
  @ApiBody({
      description: 'create a support ticket',
      type: createTicketDTO,
    })
  @UseInterceptors(FileInterceptor('file'))
  async createTicket(
    @CurrentUser() user: Staff, 
    @Body() data: createTicketDTO,
  ) {
    return this.supportService.createTicket(data);
  }

  @ApiBearerAuth()
  @UseInterceptors(AuthUserInterceptor)
  @Post('reply-support-ticket')
   @ApiBody({
      description: 'reply a support ticket',
      type: replyTicketDTO,
    })
  @UseInterceptors(FileInterceptor('file'))
  async replyTicket(
    @CurrentUser() user: Staff, 
    @Body() data: replyTicketDTO,
  ) {

    return this.supportService.replyTicket(data);
  }

  @ApiBearerAuth()
  @UseInterceptors(AuthUserInterceptor)
  @ApiOperation({ summary: 'Retrieve all tickets created' })
  @Get('get-all-tickets')
  async getAllTickets( @CurrentUser() user: Staff, ) {
    return this.supportService.getAllTickets();
  }

  @ApiBearerAuth()
  @UseInterceptors(AuthUserInterceptor)
  @Get('get-single-ticket/:id')
  @ApiOperation({ summary: 'retrieve a support ticket by id' })
  async getSingleTicket( @CurrentUser() user: Staff, @Param('id') id: string) {
    return this.supportService.getSingleTicket(id);
  }

  @ApiBearerAuth()
  @UseInterceptors(AuthUserInterceptor)
  @Get('get-support-departments')
  @ApiOperation({ summary: 'retrieve all support department' })
  async getDepartments(@CurrentUser() user: Staff) { 
    return this.supportService.getDepartments();
  }

  @ApiBearerAuth()
  @UseInterceptors(AuthUserInterceptor)
  @Post('upload-file')
  @ApiOperation({ summary: 'Upload a file to support system' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFileToSupport(
  @CurrentUser() user: Staff,  
  @UploadedFile() file: Express.Multer.File
  ) {
  return this.supportService.uploadFile(file);
  }
}
