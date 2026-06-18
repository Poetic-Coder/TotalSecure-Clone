import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsISO8601, IsObject, IsOptional, IsString } from "class-validator";


export class AddressPayload {
  @ApiProperty({ description: "Webhook event" })
  @IsString()
  event: string;

  @ApiProperty({ description: "Webhook event type" })
  @IsString()
  event_type: string;

  @ApiProperty({ description: "Webhook data" })
  @IsObject()
  data: {
    id: number;
    customerReference: string;
    applicant: {
      firstname: string;
      lastname: string;
      middlename: string;
      phone: string;
      dob: string;
      email: string;
    };
    status: {
      status: string;
      state: string;
    };
    summary: {
      address_check: string;
    };
    address: {
      [key: string]: any;
    };
  };

  @IsOptional()
  retryCount?: number;
}


export class TransferPayload {
  @ApiProperty({ description: "Transfer event" })
  @IsString()
  event: string;

  @ApiProperty({ description: "Transfer event type" })
  @IsString()
  event_type: string;

  @ApiProperty({ description: "Transfer id" })
  @IsString()
  id: string;

  @IsOptional()
  retryCount?: number;
}


export enum CardStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  DECLINED = 'DECLINED',
  BLOCKED = 'BLOCKED',
  LOCKED = 'LOCKED',
}
export class CardPayload {
  @ApiProperty({ description: "Webhook event" })
  @IsString()
  event: string;
  @ApiProperty({ description: "Webhook event type Virtual Or Physical" })
  @IsString()
  event_type: string;
  @ApiProperty({ description: "Webhook data" })
  @IsObject()
  data: {
    PlainCVV2: string;
    PlainCardNumber: string;
    PlainExpiryDate: string;
    AccountNumber: string;
  };
  @ApiProperty({
    enum: CardStatus,
    description: "The is the status of the card",
  })
  @IsString()
  status: CardStatus;
}

export class AgentApprovalDto {
  @IsString()
  bankAccountNumber: string;

  @IsString()
  accountName: string;

  @IsEnum(['APPROVED', 'REJECTED'])
  status: string;

  @IsISO8601()
  approvedAt: string;

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsString()
  phone: string
}