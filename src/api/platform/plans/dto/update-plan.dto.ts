import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';

export class UpdatePlatformPlanDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  monthlyPrice?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  quarterlyPrice?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  annualPrice?: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  hasGuardManagement?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  hasPatrolManagement?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  hasVisitorManagement?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  hasVehicleManagement?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  hasIncidentManagement?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  hasCctvIntegration?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  hasCommandCenter?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  hasReporting?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  hasAdvancedAnalytics?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  hasApiAccess?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  hasBiometricCheckin?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  hasSmsAlerts?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  hasEmailAlerts?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  hasMultiBranch?: boolean;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  maxSites?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  maxGuardsDeployed?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  maxCameras?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  maxStaffUsers?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  storageRetentionDays?: number;
}