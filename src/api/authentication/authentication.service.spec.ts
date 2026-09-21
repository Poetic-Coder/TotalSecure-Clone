import { UserModule } from '@api/user/user.module';
import { DatabaseModule } from '@database/database.module';
import { HashingModule } from '@modules/hashing/hashing.module';
import { RbacModule } from '@api/rbac/rbac.module';
import { SecurityModule } from '@modules/security/security.module';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './authentication.service';

describe('AuthenticationService', () => {
  let service: AuthenticationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        UserModule,
        DatabaseModule,
        HashingModule,
        SecurityModule,
        RbacModule,
      ],
      providers: [AuthenticationService],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
