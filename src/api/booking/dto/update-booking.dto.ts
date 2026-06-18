import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateBookingDto {
  @ApiProperty({
    description: 'Update the overall status of the booking.',
    enum: BookingStatus,
    required: false,
    example: BookingStatus.CONFIRMED,
  })
  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;

  @ApiProperty({
    description: 'Update the payment status of the booking.',
    enum: PaymentStatus,
    required: false,
    example: PaymentStatus.PAID,
  })
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @ApiProperty({
    description: 'The ID of the staff member who issued the ticket.',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  issuedById?: string;

  @ApiProperty({
    description: 'Internal notes about the booking.',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}