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
      case AccountType.AGENT:
        whereClause.agentId = userId;
        break;
      case AccountType.CUSTOMER:
        whereClause.customerId = userId;
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
        context: notificationData.data.context,
        staffId: notificationData.data.staffId,
        agentId: notificationData.data.agentId,
        customerId: notificationData.data.customerId,
      },
    });
  }

  async updateNotification(id: string, updateNotification: any) {
    const { ...updateData } = updateNotification;
    const read_bool = updateData.data.read === 'true' || updateData.data.read === true;
    
    return this.prisma.notification.update({
      where: { id },
      data: {
        read: read_bool,
        staffId: updateData.data.staffId,
        agentId: updateData.data.agentId,
        customerId: updateData.data.customerId,
      },
    });
  }
}