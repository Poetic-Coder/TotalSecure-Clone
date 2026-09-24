import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import {
  ClientType,
  PlatformStaffRole,
  StaffRole,
} from '@prisma/client';
import { AccountType } from '@common/enums';

export class SharedLoginDto {
  @ApiProperty({
    example: 'ops@acme.guards.ng',
    description: 'Account email (type resolved by the portal endpoint)',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterCompanyDto {
  @ApiProperty({ example: 'Acme Guards Ltd' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'acme.guards.ng' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/, {
    message: 'domain must be a lowercase hostname, e.g. acme.guards.ng',
  })
  domain: string;

  @ApiProperty({ example: 'hello@acme.guards.ng' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ example: '+2348012345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brandName?: string;

  @ApiPropertyOptional({ example: '#0F172A' })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  supportEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;
}

export class RegisterClientDto {
  @ApiProperty({
    description: 'White-label company domain',
    example: 'acme.guards.ng',
  })
  @IsString()
  @IsNotEmpty()
  domain: string;

  @ApiProperty({ example: 'GTBank Nigeria' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'security@gtbank.ng' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: '+2348033333333' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+234[0-9]{10}$/, {
    message: 'Phone number must be in Nigerian international format e.g. +2348012345678',
  })
  phone: string;

  @ApiPropertyOptional({ enum: ClientType, default: ClientType.ORGANIZATION })
  @IsOptional()
  @IsEnum(ClientType)
  clientType?: ClientType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'ops@acme.guards.ng' })
  @IsEmail()
  email: string;

  @ApiProperty({
    enum: AccountType,
    description:
      'Must match the portal account. Platform: PLATFORM_STAFF. Company portal: COMPANY or STAFF. Client: CLIENT. Guard: GUARD. Client staff: CLIENT_STAFF.',
  })
  @IsEnum(AccountType)
  accountType: AccountType;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'ops@acme.guards.ng' })
  @IsEmail()
  email: string;

  @ApiProperty({
    enum: AccountType,
    description: 'Same accountType used when requesting the OTP',
  })
  @IsEnum(AccountType)
  accountType: AccountType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  otp: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class VerifyMfaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  mfaToken: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class PasswordConfirmDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RejectAccountDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

export class CreatePlatformStaffDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ enum: PlatformStaffRole })
  @IsEnum(PlatformStaffRole)
  role: PlatformStaffRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;
}

export class AssignCompanyDto {
  @ApiProperty()
  @IsUUID()
  platformStaffId: string;

  @ApiProperty()
  @IsUUID()
  companyId: string;
}

export class CreateCompanyStaffDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ enum: StaffRole })
  @IsEnum(StaffRole)
  role: StaffRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employeeId?: string;
}

export class CreateCompanyClientDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+234[0-9]{10}$/, {
    message: 'Phone number must be in Nigerian international format e.g. +2348012345678',
  })
  phone: string;

  @ApiPropertyOptional({ enum: ClientType })
  @IsOptional()
  @IsEnum(ClientType)
  clientType?: ClientType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;
}

/** Successful login / refresh / impersonate response */
export class AuthSessionResponseDto {
  @ApiProperty({
    description: 'Short-lived JWT access token (~30m)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;

  @ApiProperty({
    description:
      'Opaque refresh token (~7d). Send to the same portal `/.../auth/refresh` or `/.../auth/logout`',
  })
  refreshToken: string;

  @ApiProperty({ example: '30m' })
  expiresIn: string;

  @ApiProperty({
    description:
      'Account payload without password. Includes accountType, companyId/clientId when applicable, and impersonatedBy when impersonating.',
  })
  userAccount: Record<string, unknown>;
}

export class MessageResponseDto {
  @ApiProperty()
  message: string;
}
