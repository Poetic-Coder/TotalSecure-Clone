import { 
  Controller, 
  Get, 
  Post,
  Body, 
  Param, 
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { 
    ApiBearerAuth, 
    ApiOperation, 
    ApiTags, 
} from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { AuthUserInterceptor } from '@common/interceptors/authenticated-account.interceptor';
import { CurrentUser } from '@common/decorators/current-user';
import { Roles } from '@common/decorators/role.decorator';
import { RolesGuard } from '@api/authentication/guards/role.guard';
import { AccountType } from '@common/enums';
import { reviewGroupBookingDto, ApproveGroupBookingDto, RejectGroupBookingDto } from './dto/booking.dto';
import { GroupBookingStatus } from '@prisma/client';

@ApiTags('Admin - Bookings')
@Controller('admin-booking') 
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @ApiBearerAuth()
  @UseInterceptors(AuthUserInterceptor)
  @UseGuards(RolesGuard)
  @Roles(AccountType.STAFF)
  @Get('get-all-bookings')
  @ApiOperation({ summary: 'Get all group booking requests' })
  public async getAllGroupBookings(
    @Query('status') status?: GroupBookingStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {

    return this.bookingService.getAllGroupBookings({ 
        status, 
        page: Number(page || 1), 
        limit: Number(limit || 10) 
    });
  }

  @ApiBearerAuth()
  @UseInterceptors(AuthUserInterceptor)
  @UseGuards(RolesGuard)
  @Roles(AccountType.STAFF)
  @Post('review-booking/:id')
  @ApiOperation({ summary: 'Submit a request to Saudia for review' })
  public async reviewGroupBooking(
    @Param('id') id: string,
    @Body() dto: reviewGroupBookingDto,
    @CurrentUser() staff: any, 
  ) {
    return this.bookingService.reviewGroupBooking(id, dto, staff);
  }

  @ApiBearerAuth()
  @UseInterceptors(AuthUserInterceptor)
  @UseGuards(RolesGuard)
  @Roles(AccountType.STAFF)
  @Post('approve-booking/:id')
  @ApiOperation({ summary: 'Approve a group booking request' })
  public async approveGroupBooking(
    @Param('id') id: string,
    @Body() dto: ApproveGroupBookingDto,
    @CurrentUser() staff: any,
  ) {
    return this.bookingService.approveGroupBooking(id, dto, staff); 

  }

  @ApiBearerAuth()
  @UseInterceptors(AuthUserInterceptor)
  @UseGuards(RolesGuard)
  @Roles(AccountType.STAFF)
  @Post('reject-booking/:id')
  @ApiOperation({ summary: 'Reject a group booking request' })
  public async rejectGroupBooking(
    @Param('id') id: string,
    @Body() dto: RejectGroupBookingDto,
    @CurrentUser() staff: any,
  ) {
    return this.bookingService.rejectGroupBooking(id, dto, staff);
  }
}