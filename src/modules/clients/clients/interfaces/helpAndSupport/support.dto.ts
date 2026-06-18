import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";


export enum TicketPriority {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low"
}

export class createTicketDTO {
   @ApiProperty({ description: "The subject of the ticket" })
   @IsString()
   @IsNotEmpty()
   subject: string;

   @ApiProperty({ description: "The detailed message of the ticket" })
   @IsString()
   @IsNotEmpty()
   message: string;

  @ApiProperty({
    description: "The priority level of the ticket; acceptable values are high, medium, or low",
    enum: TicketPriority
  })
  @IsEnum(TicketPriority, {
    message: "Priority must be one of: high, medium, low"
  })
  priority: TicketPriority;

   @ApiProperty({ description: "The identifier for the department handling the ticket" })
   @IsString()
   @IsNotEmpty()
   department_id: string;

   @ApiProperty({ description: "Optional file url for the ticket", required: false })
   @IsOptional()
   file?: string
}

export class replyTicketDTO {
   @ApiProperty({ description: "Unique identifier for the ticket been replied to" })
   @IsString()
   @IsNotEmpty()
   ticket_id: string;

   @ApiProperty({ description: "The detailed message of the ticket" })
   @IsString()
   @IsNotEmpty()
   message: string;

   @ApiProperty({ description: "Optional file url for the ticket", required: false })
   @IsOptional()
   file?: string
}

export class supportLoginDTO {
  @ApiProperty({ description: "User email" })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: "access token of the current loggedin user" })
  @IsString()
  @IsNotEmpty()
  token: string;
}