import { UserModule } from '@api/user/user.module';
import { DatabaseModule } from '@database/database.module';
import { HashingModule } from '@modules/hashing/hashing.module';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';

describe('AuthenticationController', () => {
  let controller: AuthenticationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, UserModule, HashingModule],
      controllers: [AuthenticationController],
      providers: [AuthenticationService],
    }).compile();

    controller = module.get<AuthenticationController>(AuthenticationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
