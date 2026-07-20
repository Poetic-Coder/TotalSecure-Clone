import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UseGuards,
  Logger,
  CACHE_MANAGER,
  Inject,
  BadRequestException
} from '@nestjs/common';
import {
  ApiTags,
  ApiBody,
  ApiOkResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthenticationService } from './authentication.service';
import { BvnRegisterDto, IGreeIdpDto, RegisterCustomerDto, RegisterAgentDto, RegisterStaffDto, RegisterGuardDto } from './dtos/register.dto';
import { OtpResponseDto, OtpDto } from './dtos/otp.dto';
import { LoginDto } from './dtos/login.dto';
import { UserService } from '@api/user/services/user.service';
import { CurrentUser } from '@common/decorators/current-user';
import { AuthUserInterceptor } from '@common/interceptors/authenticated-account.interceptor';
import { AnyUser } from '@common/interfaces';
import { JwtDto } from './dtos/jwt.dto';
import { RolesGuard } from './guards/role.guard'; // <-- Use your existing guard
import { Roles } from '@common/decorators/role.decorator';
import { StaffProfileDto } from '@api/user/dtos/staff-profile.dto';
import { AgentProfileDto } from '@api/user/dtos/agent-profile.dto';
import { ProfileDto } from '@api/user/dtos/profile.dto';
import { CustomerProfileDto } from '@api/user/dtos/customer-profile.dto';
import { AccountType } from '@common/enums';
import { ApiKeyUserGuard } from './guards/api-key-role.guard';
import { ApiHeaders } from '@common/decorators/defaultHeaders';
import { getRandomString } from '@common/utils/general';
import { OTP_EXPIRY } from '@common/constants';
import { Cache } from 'cache-manager';
import { GuardProfileDto } from '@api/user/dtos/guard-profile.dto';



@ApiTags('Authentication')
@Controller('auth')
export class AuthenticationController {
  private readonly logger = new Logger(AuthenticationController.name)

  constructor(
    private readonly authService: AuthenticationService,
    private readonly userService: UserService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}


  @Post('/login/staff')
  @ApiBody({
    description: 'Login staff',
    type: LoginDto,
  })
  public async loginStaff(@Body() payload: any) {
    let user;

     user = await this.authService.loginStaff(payload.email, payload.password);

    const token = await this.authService.authenticate(user);
    
    return new JwtDto({
      userAccount: {
        ...user,
        profile: user.profile as StaffProfileDto,
      },
      token,
    });
  }

  @Post('/login/guard')
  @ApiBody({
    description: 'Login Guard',
    type: LoginDto,
  })
  public async loginGuard(@Body() payload: any) {
    let user;

     user = await this.authService.loginGuard(payload.email, payload.password);

    const token = await this.authService.authenticate(user);
    
    return new JwtDto({
      userAccount: {
        ...user,
        profile: user.profile as GuardProfileDto,
      },
      token,
    });
  }

  

  @Post('/send/otp')
  @UseGuards(RolesGuard)
  @Roles(AccountType.GUARD, AccountType.CLIENT)
  @ApiOkResponse({
    description: 'Send otp to email and phone',
    type: OtpResponseDto,
  })
  public async sendOtpAgent(@Body() payload: any): Promise<OtpResponseDto> {
    const {phone, email} = payload;

    if (!phone && !email) {
      throw new Error("Bad request");   
    }

    await this.userService.sendOtpAndEmail({ phone, email });

    return {
      message: 'Email and Phone otp sent',
      status: true,
    };
  }

  @Post('/verify/otp')
  @UseGuards(RolesGuard)
  @Roles(AccountType.GUARD, AccountType.CLIENT)
  @ApiBody({
    description: "Verifies user's OTP",
    type: OtpDto,
  })
  @ApiOkResponse({
    description: 'Verified OTP',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'message' },
        status: { type: 'boolean', description: 'staus' },
        registerAccessToken: { type: 'string', description: 'access token for register' },
      },
    },
  })
  public async verifyOtpAgent(
    @Body() payload: any
  ) {
    const { otp, phone, email } = payload;
    
    const status = phone 
      ? await this.userService.verifyPhoneOtp(phone, otp) 
      : email 
      ? await this.userService.verifyEmailOtp(email, otp) 
      : false;

    if (status) {
      const registerAccessToken = await this.generateRegisterAccessToken(phone)
      return {
        message: 'OTP verified',
        status: true,
        registerAccessToken: registerAccessToken,
      };
    }

    return {
      message: 'OTP not verified',
      status: false,
     
    };
  }

  public async generateRegisterAccessToken(phone: string) {
    const token = getRandomString(32);
    this.logger.debug(`\nToken: ${token}\n`);

    await this.cacheManager.set(phone, token, OTP_EXPIRY);

    return token;
  }

  public async verifyRegisterAccessToken(phone: string, token: string) {
    try {
      const cachedToken = await this.cacheManager.get<string>(phone);
      this.logger.debug(`\nCached Token: ${cachedToken}\n`);
      if (cachedToken === token) {
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error("get cache", error);
      return false;
    }

  }

    @Post('register/staff')
    @UseGuards(RolesGuard)
    @Roles(AccountType.ADMIN)
    @ApiBody({ type: RegisterStaffDto })
    @ApiOkResponse({
      description: 'Registered Staff',
    })
    public async registerStaff(@Body() payload: RegisterStaffDto) {
      const user = await this.authService.createStaff(payload);

      return `New Staff "${user.profile.firstName} ${user.profile.middleName} ${user.profile.lastName}" has been added.`;
    }

    @Post('register/guard')
    @UseGuards(RolesGuard)
    @Roles(AccountType.ADMIN)
    @ApiBody({ type: RegisterGuardDto })
    @ApiOkResponse({
      description: 'Registered Guard',
    })
    public async registerGuard(@Body() payload: RegisterGuardDto) {
      const Guard = await this.authService.createGuard(payload);

      return Guard;
    }
  
}