import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GenerateTokenArgs, TokenData, TokenType } from './security.interface';
import * as bcrypt from 'bcrypt';
import Deasyncify from 'deasyncify';
import {
  InvalidTokenException,
  InvalidTokenTypeException,
  TokenExpiredException,
} from '@modules/security/security.errors';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(10);
      return bcrypt.hash(password, salt);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  public async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return bcrypt.compare(password, hashedPassword);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  public async generateToken({
    data,
    expiresIn = '60s',
  }: GenerateTokenArgs): Promise<string> {
    const JWT_SECRET = this.configService.get<string>('APP_JWT_SECRET');

    return this.jwtService.signAsync(
      { data },
      {
        expiresIn,
        secret: JWT_SECRET,
      },
    );
  }

  public verifyToken = async (
    token: string,
    tokenType: TokenType,
  ): Promise<TokenData> => {
    const JWT_SECRET = this.configService.get<string>('APP_JWT_SECRET');
    const [decoded, err] = await Deasyncify.watch(
      this.jwtService.verifyAsync(token, {
        secret: JWT_SECRET,
      }),
    );

    if (err != null) {
      if (err.name === 'TokenExpiredError') {
        throw new TokenExpiredException();
      }

      throw new InvalidTokenException();
    }

    const data = decoded.data as TokenData;

    if (data.tokenType == tokenType) {
      return data;
    }

    throw new InvalidTokenTypeException();
  };
}
