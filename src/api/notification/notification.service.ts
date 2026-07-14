import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { PrismaService } from '@database/prisma.service';
import { AccountType } from '@common/enums';
import { Prisma } from '@prisma/client';


@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotifications(userId: string, accountType: AccountType) {
    const whereClause: Prisma.NotificationWhereInput = {};
    switch (accountType) {
      case AccountType.STAFF:
        whereClause.staffId = userId;
        break;
      case AccountType.GUARD:
        whereClause.guardId = userId;
        break;
      case AccountType.CLIENT:
        whereClause.clientId = userId;
        break;
      default:
        throw new BadRequestException('Invalid account type for notifications.');
    }
    return this.prisma.notification.findMany({
      where: { ...whereClause }, 
      orderBy: { createdAt: 'desc' },
    });
  }

  async createNotification(createNotification: any) {
    const { token, ...notificationData } = createNotification;

    return this.prisma.notification.create({
      data: {
        title : notificationData.data.title,
        message:  notificationData.data.message,
        type:  notificationData.data.type,
        staffId: notificationData.data.staffId,
        guardId: notificationData.data.guardId,
        clientId: notificationData.data.clientId,
      },
    });
  }

  async updateNotification(id: string, updateNotification: any) {
    const { ...updateData } = updateNotification;
    const read_bool = updateData.data.read === 'true' || updateData.data.read === true;
    
    return this.prisma.notification.update({
      where: { id },
      data: {
        isRead: read_bool,
        staffId: updateData.data.staffId,
        guardId: updateData.data.guardId,
        clientId: updateData.data.clientId,
      },
    });
  }
}