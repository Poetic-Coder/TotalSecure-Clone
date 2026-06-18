import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";


export class AppzoneWebhookDto {
  @ApiProperty({ description: "Transaction amount in kobo" })
  @IsNumber()
  Amount: number;

  @ApiProperty({ description: "Payer's account number" })
  @IsString()
  AccountNumber: string;

  @ApiProperty({ description: "Payer's account name" })
  @IsString()
  AccountName: string;

  @ApiProperty({ description: "Institution's customer available balance" })
  @IsNumber()
  AvailableBalance: number;

  @ApiProperty({ description: "Institution's customer ledger balance" })
  @IsNumber()
  LedgerBalance: number;

  @ApiProperty({ description: "Transaction narration" })
  @IsString()
  Narration: string;

  @ApiProperty({ description: "Transaction channel" })
  @IsString()
  Channel: string;

  @ApiProperty({ description: "Transaction fee" })
  @IsNumber()
  Charge: number;

  @ApiProperty({ description: "Date of transaction (e.g., 2021-02-09T15:27:43)" })
  @IsString()
  DateTime: string;

  @ApiProperty({ description: "Beneficiary's account number" })
  @IsString()
  RecipientAccountNumber: string;

  @ApiProperty({ description: "Beneficiary's account name" })
  @IsString()
  RecipientAccountName: string;

  @ApiProperty({ description: "Unique reference for transaction" })
  @IsString()
  TransactionReference: string;

  @ApiProperty({ description: "Transaction type" })
  @IsString()
  TransType: string;

  @ApiProperty({ description: "Represents response of the transaction based on ISO response code" })
  @IsString()
  ResponseCode: string;

  @ApiProperty({ description: "Identifies the GL account to be imparted" })
  @IsString()
  GLCode: string;

  @ApiProperty({ description: "Notification description" })
  @IsString()
  Description: string;
}
