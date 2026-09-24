import { ApiProperty } from '@nestjs/swagger';
import { VerificationStatus } from '@prisma/client';
import { IsString, IsUrl } from 'class-validator';

export class ProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  bvn: string | null;

  @ApiProperty({ enum: VerificationStatus })
  @IsString()
  bvnVerified: VerificationStatus;

  @ApiProperty({ enum: VerificationStatus })
  @IsString()
  idVerified: VerificationStatus;

  @ApiProperty({ enum: VerificationStatus })
  @IsString()
  addressVerified: VerificationStatus;

  @ApiProperty({ enum: VerificationStatus })
  @IsString()
  faceVerified: VerificationStatus;
}

export class PhotoUploadDto {
  @ApiProperty()
  @IsUrl()
  photo: string;
}

export class UpdateProfileDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;
}
