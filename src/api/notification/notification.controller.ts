import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { FirebaseFcmService } from '@modules/firebase/firebase-fcm.service';

import { ApiHeaders } from '@common/decorators/defaultHeaders';
import {
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AccountType } from '@common/enums';

@ApiTags('Notification')
@ApiHeaders()
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService,
              private readonly firebaseService: FirebaseFcmService,) {}

  @Post()
  @ApiBody({
    description: 'Create a notification',
    type: CreateNotificationDto
  })
  @ApiOkResponse({
    description: 'Notification response'
  })           
  @Post()
  public async sendNotification(@Body() notificationData: { token: string; data?: any }) {
    const { token, data } = notificationData;
    const add_notfication =  this.notificationService.createNotification(notificationData);
    return await this.firebaseService.sendMessage(token, data);
  }

 
  @Get(':userId')
  @ApiOkResponse({
    description: 'Notification response',
    type: CreateNotificationDto
  })           
  @Post()
  @Get(':userId')
  public async getNotifications(@Param('userId') userId: string,  @Query('accountType') accountType: AccountType,) {
    return this.notificationService.getNotifications(userId, accountType);
  }



  @Put(':id')
  public async updateNotification(@Param('id') id: string, @Body() data: { read: boolean }) {
    return this.notificationService.updateNotification(id, data);
  }
}