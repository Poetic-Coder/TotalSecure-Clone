import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class BookingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.BookingCreateArgs) {
    return this.prisma.booking.create(data);
  }

  async findById(id: string) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: {
        passengers: true,
        trip: {
          include: {
            origin: true,
            destination: true,
            aircraft: true,
          },
        },
        staff: { include: { profile: true } },
        agent: { include: { profile: true } },
        customer: { include: { profile: true } },
      },
    });
  }

  async findByPNR(pnr: string) {
    return this.prisma.booking.findFirst({
      where: { pnr },
      include: {
        passengers: true,
        trip: {
          include: {
            origin: true,
            destination: true,
          },
        },
      },
    });
  }

  async findByBookingRef(bookingRef: string) {
    return this.prisma.booking.findFirst({
      where: { bookingRef },
      include: {
        passengers: true,
        trip: true,
      },
    });
  }

  async findMany(params: Prisma.BookingFindManyArgs) {
    return this.prisma.booking.findMany(params);
  }

  async count(where: Prisma.BookingWhereInput) {
    return this.prisma.booking.count({ where });
  }

  async update(params: Prisma.BookingUpdateArgs) {
    return this.prisma.booking.update(params);
  }

  async delete(id: string) {
    return this.prisma.booking.delete({ where: { id } });
  }

  // Group Booking methods
  async createGroupBooking(data: Prisma.GroupBookingCreateArgs) {
    return this.prisma.groupBooking.create(data);
  }

  async findGroupBookingById(id: string) {
    return this.prisma.groupBooking.findFirst({
      where: { id },
      include: {
        trip: {
          include: {
            origin: true,
            destination: true,
          },
        },
        agent: { include: { profile: true } },
      },
    });
  }

  async findGroupBookingsByAgent(agentId: string) {
    return this.prisma.groupBooking.findMany({
      where: { requestedById: agentId },
      include: {
        trip: {
          include: {
            origin: true,
            destination: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateGroupBooking(params: Prisma.GroupBookingUpdateArgs) {
    return this.prisma.groupBooking.update(params);
  }

  // Passenger methods
  async createPassenger(data: Prisma.PassengerCreateArgs) {
    return this.prisma.passenger.create(data);
  }

  async findPassengersByBooking(bookingId: string) {
    return this.prisma.passenger.findMany({
      where: { bookingId },
    });
  }

  async updatePassenger(params: Prisma.PassengerUpdateArgs) {
    return this.prisma.passenger.update(params);
  }

  // Statistics methods
  async getBookingStats(filters?: any) {
    const where: any = {};
    
    if (filters?.startDate && filters?.endDate) {
      where.createdAt = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }

    const [
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.booking.count({ where }),
      this.prisma.booking.count({
        where: { ...where, status: 'CONFIRMED' },
      }),
      this.prisma.booking.count({
        where: { ...where, status: 'CANCELLED' },
      }),
      this.prisma.booking.aggregate({
        where: { ...where, paymentStatus: 'PAID' },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
    };
  }

  async getAgentBookingStats(agentId: string, filters?: any) {
    const where: any = { agentId };
    
    if (filters?.startDate && filters?.endDate) {
      where.createdAt = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }

    const [totalBookings, totalCommission] = await Promise.all([
      this.prisma.booking.count({ where }),
      this.prisma.booking.aggregate({
        where: { ...where, paymentStatus: 'PAID' },
        _sum: { commission: true },
      }),
    ]);

    return {
      totalBookings,
      totalCommission: totalCommission._sum.commission || 0,
    };
  }

  async getCustomerLoyaltyPoints(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: { loyaltyPoints: true },
    });
    return customer?.loyaltyPoints || 0;
  }
}