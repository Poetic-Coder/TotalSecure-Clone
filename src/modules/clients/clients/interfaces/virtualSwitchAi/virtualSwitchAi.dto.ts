import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";


export enum ImageType {
  heads_up = 'heads_up',
  heads_down = 'heads_down',
  eyes_closed =  'eyes_closed'
};


export class FaceAndLivenessDTO {
   @ApiProperty({ description: "User's profile photo" })
   @IsString()
   @IsNotEmpty()
   profilePhoto: string;
   @ApiProperty({ description: "User's neutral photo" })
   @IsString()

   neutralPhoto: string;
   @ApiProperty({ description: "User's eyes closed photo" })
   @IsString()

   eyesClosedPhoto: string;
   @ApiProperty({ description: "User's face up photo" })
   @IsString()

   faceUpPhoto: string;
   @ApiProperty({ description: "User's face down photo" })
   @IsString()

   faceDownPhoto: string;
 }

 export class FaceDTO {
  @ApiProperty({ description: "User's photo" })
  @IsString()
  @IsNotEmpty()
  image_url: string;
}

export class FaceExpressionDTO {
  @ApiProperty({ description: "User's photo" })
  @IsString()
  @IsNotEmpty()
  image_url: string;

  @ApiProperty({ description: "Image type", enum: ImageType})
  @IsString()
  @IsNotEmpty()
  type: ImageType;

}

export class IdDocVerificationDTO {
  @ApiProperty({ description: "File url" })
  @IsString()
  @IsNotEmpty()
  file_url: string;
  @ApiProperty({ description: "ID Type" })
  @IsString()
  @IsNotEmpty()
  id_type: string;
  @ApiProperty({ description: "ID number" })
  @IsString()
  @IsNotEmpty()
  id_number: string;
}