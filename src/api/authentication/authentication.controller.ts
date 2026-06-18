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
import { BvnRegisterDto, IGreeIdpDto, RegisterCustomerDto, RegisterAgentDto } from './dtos/register.dto';
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



@ApiTags('Authentication')
@Controller('auth')
export class AuthenticationController {
  private readonly logger = new Logger(AuthenticationController.name)

  constructor(
    private readonly authService: AuthenticationService,
    private readonly userService: UserService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Post('/login/agent')
  @UseGuards(RolesGuard)
  @Roles(AccountType.AGENT)
  @ApiBody({
    description: 'Login agent',
    type: LoginDto,
  })
  public async loginAgent(@Body() payload: any) {
    let user;

     user = await this.authService.loginAgent(payload.email, payload.password);

    const token = await this.authService.authenticate(user);
    
    return new JwtDto({
      userAccount: {
        ...user,
        profile: user.profile as AgentProfileDto, 
      },
      token,
    });
  }

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

  @Post('/login/customer')
  @UseGuards(RolesGuard)
  @Roles(AccountType.CUSTOMER)
  @ApiBody({
    description: 'Login customer',
    type: LoginDto,
  })
  public async loginCustomer(@Body() payload: any) {
    let user;

     user = await this.authService.loginCustomer(payload.email, payload.password);

    const token = await this.authService.authenticate(user);
    
    return new JwtDto({
      userAccount: {
        ...user,
        profile: user.profile as ProfileDto,
      },
      token,
    });
  }
 
  @Post('register/agent')
  @UseGuards(RolesGuard)
  @Roles(AccountType.AGENT)
  @ApiBody({ type: RegisterAgentDto })
  @ApiOkResponse({
    description: 'Registered agent',
    type: JwtDto,
  })
  public async registerAgent(@Body() payload: RegisterAgentDto) {
    const { phone, password, email, registerAccessToken } = payload;

    const verifyAccessToken = await this.verifyRegisterAccessToken(phone, registerAccessToken)
    if (!verifyAccessToken) {
      throw new BadRequestException('Access token invalid')
    }

    const user = await this.authService.registerAgent(email, phone, password);
    const token = await this.authService.authenticate(user);
    return new JwtDto({
      userAccount: {
        ...user,
        profile: user.profile as AgentProfileDto, 
      },
      token,
    });
  }

  @Post('register/customer')
  @UseGuards(RolesGuard)
  @Roles(AccountType.CUSTOMER)
  @ApiBody({ type: RegisterCustomerDto })
  @ApiOkResponse({
    description: 'Registered customer',
    type: JwtDto,
  })
  public async registerCustomer(@Body() payload: RegisterCustomerDto) {
    const { phone, password, email, registerAccessToken } = payload;

    const verifyAccessToken = await this.verifyRegisterAccessToken(phone, registerAccessToken)
    if (!verifyAccessToken) {
      throw new BadRequestException('Access token invalid')
    }

    const user = await this.authService.registerCustomer(email, phone, password);
    const token = await this.authService.authenticate(user);
    return new JwtDto({
      userAccount: {
        ...user,
        profile: user.profile as CustomerProfileDto, 
      },
      token,
    });
  }
  

  @Post('/send/otp')
  @UseGuards(RolesGuard)
  @Roles(AccountType.AGENT, AccountType.CUSTOMER)
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
  @Roles(AccountType.AGENT, AccountType.CUSTOMER)
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

  
}