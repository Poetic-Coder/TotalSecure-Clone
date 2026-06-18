import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { BookingRepository } from './booking.repository';
import { CreateBookingDto, SearchFlightsQueryDto, CreateGroupBookingRequestDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { getRandomString } from '@common/utils/general';
import { generateApplicationLetter } from '@common/utils/document';
import { Agent, GroupBookingStatus, Prisma, TripClass } from '@prisma/client';
import { AgentWithProfile } from '@api/user/repositories/agent.repository';
import { AgentProfileService } from '@api/user/services/agent-profile.service';
import { PrismaService } from '@database/prisma.service';
import { AgentDto } from '@api/user/dtos/agent.dto';
import { AmadeusClient } from '@modules/clients/clients/amadeus/amadeus';
import { FlightOfferSearchRequestDto } from '@modules/clients/clients/interfaces/amadeus/amadeus.dto';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    private readonly repository: BookingRepository,
    private readonly prisma: PrismaService,
    private readonly amadeusClient: AmadeusClient,
    private readonly agentProfileService: AgentProfileService,

  ) {
  }

  async searchFlights(query: SearchFlightsQueryDto) {
    try {
      const params = new URLSearchParams({
        originLocationCode: query.originLocationCode,
        destinationLocationCode: query.destinationLocationCode,
        departureDate: query.departureDate,
        adults: (query.adults || 1).toString(),
        ...(query.returnDate && { returnDate: query.returnDate }),
        ...(query.children && { children: query.children.toString() }),
        ...(query.infants && { infants: query.infants.toString() }),
        ...(query.currencyCode && { currencyCode: query.currencyCode }),
        ...(query.max && { max: query.max.toString() }),
      });

      const result = await this.amadeusClient.searchFlightOffersGET(params.toString());
      
      return {
        success: true,
        data: result.data,
        meta: result.meta,
        dictionaries: result.dictionaries,
      };
    } catch (error) {
      this.logger.error(`Flight search failed: ${error.message}`);
      throw new BadRequestException('Failed to search flights');
    }
  }

  async searchLocations(keyword: string) {
    try {
      const locations = await this.amadeusClient.getLocationByKeyword(keyword);
      
      return {
        success: true,
        data: locations,
      };
    } catch (error) {
      this.logger.error(`Location search failed: ${error.message}`);
      throw new BadRequestException('Failed to search locations');
    }
  }

  async create(dto: CreateBookingDto) {
    const { tripId, customerId, agentId, staffId, passengers, ...rest } = dto;

    if (!customerId && !agentId && !staffId) {
      throw new BadRequestException(
        'A booking must be associated with a customer, agent, or staff member.',
      );
    }


    const pnr = getRandomString(6).toUpperCase();
    const bookingRef = `SA-${getRandomString(8).toUpperCase()}`;

    const bookingData: Prisma.BookingCreateInput = {
      ...rest,
      pnr,
      bookingRef,
      trip: { connect: { id: tripId } },
      customer: customerId ? { connect: { id: customerId } } : undefined,
      agent: agentId ? { connect: { id: agentId } } : undefined,
      staff: staffId ? { connect: { id: staffId } } : undefined,
      passengers: {
        create: passengers.map((p) => ({
          ...p,
          dateOfBirth: new Date(p.dateOfBirth),
          passportExpiry: new Date(p.passportExpiry),
        })),
      },
    };

    return this.repository.create({ data: bookingData });
  }

  async findAll(params: Prisma.BookingFindManyArgs) {
    return this.repository.findMany(params);
  }


  async findById(id: string) {
    const booking = await this.repository.findById(id);
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found.`);
    }
    return booking;
  }

  async findByPnr(pnr: string) {
    const booking = await this.repository.findByPNR(pnr);
    if (!booking) {
      throw new NotFoundException(`Booking with PNR ${pnr} not found.`);
    }
    return booking;
  }
  

  async findByBookingRef(bookingRef: string) {
    const booking = await this.repository.findByBookingRef(bookingRef);
    if (!booking) {
      throw new NotFoundException(`Booking with reference ${bookingRef} not found.`);
    }
    return booking;
  }

  async update(id: string, dto: UpdateBookingDto) {
    await this.findById(id);

    const { issuedById, ...rest } = dto;
    const updateData: Prisma.BookingUpdateInput = { ...rest };

    if (issuedById) {
      updateData.ticketIssuer = { connect: { id: issuedById } };
    }

    return this.repository.update({
      where: { id },
      data: updateData,
    });
  }


  async remove(id: string) {
    
    await this.findById(id);
    await this.repository.delete(id);
    return { message: `Booking with ID ${id} has been successfully deleted.` };
  }
  
  
  async getStats(startDate?: string, endDate?: string) {
    return this.repository.getBookingStats({ startDate, endDate });
  }
  
  
  async getAgentStats(agentId: string, startDate?: string, endDate?: string) {
    return this.repository.getAgentBookingStats(agentId, { startDate, endDate });
  }

 
  async getCustomerLoyalty(customerId: string) {
    const points = await this.repository.getCustomerLoyaltyPoints(customerId);
    return { customerId, loyaltyPoints: points };
  }

  async createGroupBooking(user: AgentWithProfile, dto: CreateGroupBookingRequestDto) {

     const agent = await this.prisma.agent.findUnique({
      where: { id: user.id },
      include: {
        profile: true, 
        kyc: true,    
      },
    });
    
    const createdBookings = await this.prisma.$transaction(async (tx) => {
      const results = [];
      for (const bookingRequest of dto.bookings) {
        const { flightOffer, groupName, passengerCount } = bookingRequest;
        const outboundSegment = flightOffer.itineraries[0].segments[0];
        const flightIdentifier = `${outboundSegment.carrierCode}${outboundSegment.number}`;
        const departureTime = new Date(outboundSegment.departure.at);
        const estimatedPrice = parseFloat(flightOffer.price.total) / flightOffer.travelerPricings.length;


            let trip = await tx.trip.findFirst({
                where: {
                    flightNumber: flightIdentifier,
                    departureDate: departureTime,
                    originCode: outboundSegment.departure.iataCode,
                    destinationCode: outboundSegment.arrival.iataCode,
                },
            });

            if (!trip) {
                trip = await tx.trip.create({
                    data: {
                        flightNumber: flightIdentifier,
                        departureDate: departureTime,
                        arrivalDate: new Date(outboundSegment.arrival.at),
                        originCode: outboundSegment.departure.iataCode,
                        destinationCode: outboundSegment.arrival.iataCode,
                        economyPrice: estimatedPrice,
                        businessPrice: estimatedPrice,
                        firstClassPrice: estimatedPrice,
                    },
                });
            }

            const groupBooking = await tx.groupBooking.create({
                data: {
                    groupRef: `GRP-${getRandomString(8).toUpperCase()}`,
                    groupName: groupName,
                    passengerCount: passengerCount,
                    requestedClass: flightOffer.travelerPricings[0].fareDetailsBySegment[0].cabin,
                    travelDate: departureTime,
                    totalAmount: estimatedPrice * passengerCount,
                    agent: { connect: { id: user.id } },
                    trip: { connect: { id: trip.id } }, 
                },
                include: {
                    trip: true,
                },
            });
        results.push(groupBooking);
      }
      return results;
    });

    const updatedBookings = await Promise.all(
      createdBookings.map(async (booking) => {
        try {
          const base64Pdf = await generateApplicationLetter(booking, agent);

      
          const pdfUrl = await this.agentProfileService.uploadApplicationLetter(base64Pdf);
          
          this.logger.log(`PDF for ${booking.groupRef} uploaded to: ${pdfUrl}`);
          return await this.prisma.groupBooking.update({
            where: { pk: booking.pk },
            data: { applicationLetterUrl: pdfUrl },
          });
        } catch (error) {
          this.logger.error(`Failed to generate/link PDF for ${booking.groupRef}: ${error.message}`);
          return booking;
        }
      })
    );

    return {
        message: `${updatedBookings.length} group booking request(s) created successfully.`,
        bookings: updatedBookings,
    };
  }

  async findAllGroupBookings(
    params: {
      status?: string;
      page: number;
      limit: number;
    },
    user: AgentWithProfile
  ) {
    const { status, page, limit } = params;

    const where: any = { requestedById: user.id };

    if (status) where.status = status;

    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.groupBooking.findMany({
        where,
        include: {
          trip: {
            include: {
              origin: {
                select: {
                  code: true,
                  city: true,
                  name: true,
                  country: true,
                }
              },
              destination: {
                select: {
                  code: true,
                  city: true,
                  name: true,
                  country: true,
                }
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.groupBooking.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findGroupBookingById(user: AgentWithProfile, bookingId: string) {
    if (!user?.id) throw new UnauthorizedException('Unauthorized agent');

    const booking = await this.prisma.groupBooking.findFirst({
      where: {
        id: bookingId,
        requestedById: user.id,
      },
      include: {
        trip: {
          include: {
            origin: true,
            destination: true,
            aircraft: true,
          },
        },
        agent: true,
      },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    return booking;
  }


}


