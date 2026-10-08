import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';
import { PlanTier } from '@prisma/client';

export class CreatePlatformPlanDto {
  @ApiProperty({ example: 'Professional' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: PlanTier })
  @IsEnum(PlanTier)
  tier: PlanTier;

  @ApiProperty({ example: 'Full access to all features' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @Min(0)
  monthlyPrice: number;

  @ApiProperty({ example: 135000, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  quarterlyPrice?: number;

  @ApiProperty({ example: 480000, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  annualPrice?: number;

  @ApiProperty({ example: 'NGN', default: 'NGN' })
  @IsString()
  @IsOptional()
  currency?: string;

  // Feature flags
  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  hasGuardManagement?: boolean;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  hasPatrolManagement?: boolean;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  hasVisitorManagement?: boolean;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  hasVehicleManagement?: boolean;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  hasIncidentManagement?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  hasCctvIntegration?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  hasCommandCenter?: boolean;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  hasReporting?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  hasAdvancedAnalytics?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  hasApiAccess?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  hasBiometricCheckin?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  hasSmsAlerts?: boolean;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  hasEmailAlerts?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  hasMultiBranch?: boolean;

  // Hard limits
  @ApiProperty({ example: 10, required: false, description: 'null = unlimited' })
  @IsNumber()
  @IsOptional()
  maxSites?: number;

  @ApiProperty({ example: 50, required: false })
  @IsNumber()
  @IsOptional()
  maxGuardsDeployed?: number;

  @ApiProperty({ example: 20, required: false })
  @IsNumber()
  @IsOptional()
  maxCameras?: number;

  @ApiProperty({ example: 10, required: false })
  @IsNumber()
  @IsOptional()
  maxStaffUsers?: number;

  @ApiProperty({ example: 30 })
  @IsNumber()
  @IsOptional()
  storageRetentionDays?: number;
}