import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards, 
  UseInterceptors,
  ParseUUIDPipe,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto, GetGroupBookingsDto, CreateGroupBookingRequestDto, SearchFlightsQueryDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiBody, 
  ApiTags,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger'
import { AnyUser } from '@common/interfaces';
import { GroupBookingStatus, Staff, TripClass } from '@prisma/client';
import { AuthUserInterceptor } from '@common/interceptors/authenticated-account.interceptor';
import { RolesGuard } from '@api/authentication/guards/role.guard';
import { AccountType } from '@common/enums';
import { Roles } from '@common/decorators/role.decorator';
import { CurrentUser } from '@common/decorators/current-user';
import { AgentWithProfile } from '@api/user/repositories/agent.repository';

@ApiTags('Bookings')
@Controller('bookings')
@ApiBearerAuth()
@UseInterceptors(AuthUserInterceptor) 
@UseGuards(RolesGuard) 
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @ApiBearerAuth()
  @UseInterceptors(AuthUserInterceptor)
  @UseGuards(RolesGuard)
  @Roles(AccountType.AGENT)
  @ApiOperation({ summary: 'Get the list of origin and destination airp' })
  @Get('search-available-flights')
  async searchFlights(@Query() dto: SearchFlightsQueryDto) {
    return this.bookingService.searchFlights(dto);
  }

  @ApiBearerAuth()
  @UseInterceptors(AuthUserInterceptor)
  @ApiOperation({ summary: 'Get airport/city by keyword' })
  @Get('locations')
  async searchLocations(@Query('keyword') keyword: string) {
    return this.bookingService.searchLocations(keyword);
  }

  @Post()
  @Roles(AccountType.STAFF, AccountType.AGENT) 
  @ApiBody({ type: CreateBookingDto })
  @ApiOkResponse({ description: 'The booking was successfully created.' })
  create(
    @Body() createBookingDto: CreateBookingDto,
    @CurrentUser() user: AnyUser & { accountType: AccountType }, 
  ) {
    if (user.accountType === AccountType.AGENT) {
      createBookingDto.agentId = user.id;
    } else if (user.accountType === AccountType.STAFF) {
      createBookingDto.staffId = user.id;
    }
    return this.bookingService.create(createBookingDto);
  }

  @Get()
  @Roles(AccountType.STAFF)
  @ApiOkResponse({ description: 'Returns a list of all bookings.' })
  findAll() {
    return this.bookingService.findAll({});
  }

  @Get('my-bookings')
  @Roles(AccountType.AGENT, AccountType.CUSTOMER)
  @ApiOkResponse({ description: "Returns a list of the user's bookings."})
  findMyBookings(@CurrentUser() user: AnyUser & { accountType: AccountType }) {
      const filter = user.accountType === AccountType.AGENT 
          ? { where: { agentId: user.id } } 
          : { where: { customerId: user.id }};
      return this.bookingService.findAll(filter);
  }

  @Get(':id')
  @Roles(AccountType.STAFF, AccountType.AGENT, AccountType.CUSTOMER)
  @ApiOkResponse({ description: 'Returns the booking details.' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AnyUser & { accountType: AccountType },
  ) {
    const booking = await this.bookingService.findById(id);

    if (user.accountType === AccountType.AGENT && booking.agentId !== user.id) {
      throw new ForbiddenException('You do not have permission to view this booking.');
    }
    if (user.accountType === AccountType.CUSTOMER && booking.customerId !== user.id) {
        throw new ForbiddenException('You do not have permission to view this booking.');
    }
    
    return booking;
  }

  @Patch(':id')
  @Roles(AccountType.STAFF)
  @ApiBody({ type: UpdateBookingDto })
  @ApiOkResponse({ description: 'The booking was successfully updated.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @CurrentUser() user: Staff,
  ) {
    if (updateBookingDto.status === 'ISSUED' && !updateBookingDto.issuedById) {
        updateBookingDto.issuedById = user.id;
    }
    return this.bookingService.update(id, updateBookingDto);
  }

  @Delete(':id')
  @Roles(AccountType.STAFF)
  @ApiOkResponse({ description: 'The booking was successfully deleted.'})
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingService.remove(id);
  }

  @ApiBearerAuth()
  @UseInterceptors(AuthUserInterceptor) 
  @UseGuards(RolesGuard)
  @Roles(AccountType.AGENT)
  @Post('/create-group-booking')
  @ApiOkResponse({ description: 'Returns the booking details.' })
  async createGroupBooking(
    @CurrentUser() user: AgentWithProfile,
    @Body() data: CreateGroupBookingRequestDto
  ) {
    return this.bookingService.createGroupBooking(user, data)
  }

  @ApiBearerAuth()
  @UseInterceptors(AuthUserInterceptor)
  @UseGuards(RolesGuard)
  @Roles(AccountType.AGENT)
  @Get('/get-group-bookings')
  @ApiOperation({ summary: 'Get all group bookings for the logged-in agent' })
  @ApiQuery({ name: 'status', required: false, enum: GroupBookingStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllGroupBookings(
    @CurrentUser() user: AgentWithProfile,
    @Query() query: GetGroupBookingsDto,
  ) {
    const { status, page, limit } = query;
    return this.bookingService.findAllGroupBookings({ status, page, limit }, user);
  }

  @ApiBearerAuth()
  @UseInterceptors(AuthUserInterceptor) 
  @UseGuards(RolesGuard)
  @Roles(AccountType.AGENT)
  @Get('/get-booking/:id')
  @ApiOperation({ summary: 'Get a specific group booking by ID (agent scoped)' })
  @ApiResponse({ status: 200, description: 'Booking details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found or not authorized' })
  async getGroupBookingById(
    @CurrentUser() user: AgentWithProfile,
    @Param('id') id: string,
  ) {
    return this.bookingService.findGroupBookingById(user, id);
  }

}