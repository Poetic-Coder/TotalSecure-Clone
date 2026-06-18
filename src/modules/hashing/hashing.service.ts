import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class HashingService {
  public async hash(data: string, salt = null) {
    if (salt != null) {
      return bcrypt.hash(data, salt);
    }
    const generatedSalt = await bcrypt.genSalt(10);
    return bcrypt.hash(data, generatedSalt);
  }

  public async compare(value: string, hash: string) {
    return bcrypt.compare(value, hash);
  }

  public base64Encode(data: string) {
    return Buffer.from(data).toString('base64');
  }

  public base64EncodeObject(data: any) {
    return this.base64Encode(JSON.stringify(data));
  }
}

@Injectable()
export class HmacService {

  constructor(
    private readonly configService: ConfigService,
  ) { }

  hash(key?: string){
    return crypto.createHmac('sha256', key || this.configService.get('APP_SESSION_SECRET'));
  }

  encrypt(payload: any, key?: string) {
    return this.hash(key).update(JSON.stringify(payload)).digest('hex');
  }

  /**
   * 
   * @example
   * 
   * const signature = token
   * const payload = request.body
   * 
   * const isValid = await service.validateSignature(signature, payload, key)
   * 
   * if (isValid) {
   * // do something
   * }
   * 
   * @param signature 
   * @param payloadBody 
   * @returns 
   */
  public async validateSignature(signature: string, payload: any, key?: string) {
    const token = this.encrypt(payload, key);
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(signature));
  }
}

@Injectable()
export class CryptoService {
  private readonly algorithm = 'aes-256-cbc'; 
  private readonly key: Buffer;
  private readonly iv: Buffer;
  constructor(private readonly configService: ConfigService) {
    const secret = this.configService.get<string>('APP_SESSION_SECRET');
    this.key = crypto.createHash('sha256').update(secret).digest();
    this.iv = crypto.randomBytes(16);
  }
  public async encrypt(text: string) {
    const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final(),
    ]);
    return `${this.iv.toString('hex')}:${encrypted.toString('hex')}`;
  }
  public async decrypt(encryptedText: string) {
    const [ivHex, encryptedHex] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  }
}