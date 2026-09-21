import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PermissionEffect, StaffRole } from '@prisma/client';

export class CreateRoleDto {
  @ApiProperty({ example: 'Site Lead' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Manages a single site' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['site:read', 'guard:read'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}

export class UpdateRoleDto {
  @ApiPropertyOptional({ example: 'Site Lead' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class SetRolePermissionsDto {
  @ApiProperty({
    type: [String],
    example: ['site:read', 'guard:read', 'incident:create'],
  })
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}

export class AssignStaffRoleDto {
  @ApiPropertyOptional({
    enum: StaffRole,
    description: 'System StaffRole enum. Clears customRole when set alone.',
  })
  @IsOptional()
  @IsEnum(StaffRole)
  staffRole?: StaffRole;

  @ApiPropertyOptional({
    description: 'Custom (or system) Role id. Takes precedence for permissions when set.',
  })
  @IsOptional()
  @IsUUID()
  customRoleId?: string | null;
}

export class PermissionOverrideItemDto {
  @ApiProperty({ example: 'invoice:delete' })
  @IsString()
  @IsNotEmpty()
  permission: string;

  @ApiProperty({ enum: PermissionEffect })
  @IsEnum(PermissionEffect)
  effect: PermissionEffect;
}

export class SetStaffPermissionOverridesDto {
  @ApiProperty({
    type: [PermissionOverrideItemDto],
    description:
      'Full replacement of this staff member overrides. Empty array clears all overrides.',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionOverrideItemDto)
  overrides: PermissionOverrideItemDto[];
}
