import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { EmailService } from '@modules/network/services/email/email.service';
import { GroupBookingStatus } from '@prisma/client';
import { reviewGroupBookingDto, ApproveGroupBookingDto, RejectGroupBookingDto } from './dto/booking.dto';


@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  
  async getAllGroupBookings(filters: { status?: GroupBookingStatus; page: number; limit?: number }) {
    const { status, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [bookings, total] = await Promise.all([
      this.prisma.groupBooking.findMany({
        where,
        include: {
          trip: true,
          agent: {
            include: { 
             profile: true,
             kyc: true,
            } 
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.groupBooking.count({ where }),
    ]);

    return {
      success: true,
      data: bookings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async reviewGroupBooking(id: string, dto: reviewGroupBookingDto, staff: any) {
    const booking = await this.prisma.groupBooking.findUnique({
      where: { id },    
      include: {
        trip: true,
        agent: {
            include: { 
             profile: true,
             kyc: true,
            } 
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Group booking not found');
    }

    if (booking.status !== GroupBookingStatus.REQUESTED) {
      throw new BadRequestException('Booking must be in REQUESTED status');
    }

    const updatedBooking = await this.prisma.groupBooking.update({
      where: { id },    
      data: {
        status: GroupBookingStatus.UNDER_REVIEW,
        reviewNotes: dto.reviewNotes,
        reviewedByPk: staff.pk,
        reviewedById: staff.id,
      },
      include: {
        trip: true,
        agent: { 
            include: { 
             profile: true,
             kyc: true,
            } 
        },
      },
    });

    try {
      if (!updatedBooking.applicationLetterUrl) {
          throw new Error('Application letter path is missing. Cannot send email.');
      }
      
      await this.emailService.sendGroupBookingToSaudia(
        { booking: updatedBooking, agent: updatedBooking.agent },
        updatedBooking.applicationLetterUrl,
      );

    } catch (error) {
      this.logger.error(`Email notifications failed for ${updatedBooking.groupRef}, but the status was successfully updated to UNDER_REVIEW.`, error);
    }
    return {
      success: true,
      message: 'Request is now under review and has been sent to Saudia.',
      data: { groupRef: updatedBooking.groupRef, status: updatedBooking.status },
    };
  }

  
  async approveGroupBooking(id: string, dto: ApproveGroupBookingDto, staff: any) {
    const booking = await this.prisma.groupBooking.findUnique({
      where: { id },    
      include: {
        trip: true,
        agent: {
          include: {
            profile: true,
            kyc: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Group booking not found');
    }

    if (booking.status !== GroupBookingStatus.UNDER_REVIEW) {
      throw new BadRequestException('Booking must be under review to approve');
    }
    const updatedBooking = await this.prisma.groupBooking.update({
      where: { id },    
      data: {
        status: GroupBookingStatus.APPROVED,
        totalAmount: dto.totalAmount,
        approvalNotes: dto.approvalNotes,
        requestDeadline: dto.requestDeadline ? new Date(dto.requestDeadline) : null,
        approvedByPk: staff.pk,
        approvedById: staff.id,
      },
    });

    return {
      success: true,
      message: 'Group booking approved successfully. Agent has been notified.',
      data: updatedBooking,
    };
  }

  
  async rejectGroupBooking(id: string, dto: RejectGroupBookingDto, staff: any) {
    const booking = await this.prisma.groupBooking.findUnique({
      where: { id },    
      include: {
        trip: true,
        agent: {
          include: {
            profile: true,
            kyc: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Group booking not found');
    }

    if (booking.status !== GroupBookingStatus.UNDER_REVIEW) {
      throw new BadRequestException('Booking must be under review to reject');
    }

    const updatedBooking = await this.prisma.groupBooking.update({
      where: { id },    
      data: {
        status: GroupBookingStatus.REJECTED,
        reviewNotes: dto.rejectionReason, 
        reviewedByPk: staff.pk,
        reviewedById: staff.id,
      },
    });

    return {
      success: true,
      message: 'Group booking has been rejected. Agent has been notified.',
      data: updatedBooking,
    };
  }

}