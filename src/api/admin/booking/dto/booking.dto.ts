import { 
  IsString, 
  IsNumber, 
  IsOptional,  
  IsEnum,
  Min,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Currency } from '@prisma/client';

export class reviewGroupBookingDto {
  @ApiProperty({ description: 'Additional notes for Saudia', required: false })
  @IsOptional()
  @IsString()
  reviewNotes?: string;
}

export class ApproveGroupBookingDto {
  @ApiProperty({ description: 'Total amount', example: 45000 })
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiProperty({ description: 'Currency', enum: Currency })
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty({ description: 'Approval notes', required: false })
  @IsOptional()
  @IsString()
  approvalNotes?: string;

  @ApiProperty({ description: 'Request deadline', required: false })
  @IsOptional()
  @IsDateString()
  requestDeadline?: string;

  @ApiProperty({ description: 'Deposit amount', required: false })
  @IsOptional()
  @IsNumber()
  depositAmount?: number;
}

export class RejectGroupBookingDto {
  @ApiProperty({ description: 'Reason for rejection' })
  @IsString()
  rejectionReason: string;
}
