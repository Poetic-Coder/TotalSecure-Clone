import { DatabaseModule } from '@database/database.module';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '@api/user/repositories/user.repository';
import { UserService } from '../services/user.service';
import { NetworkModule } from '@modules/network/network.module';
import { HashingModule } from '@modules/hashing/hashing.module';
import { CoreModule } from 'src/core/core.module';
import { UserController } from './user.controller';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, CoreModule, NetworkModule, HashingModule],
      controllers: [UserController],
      providers: [UserService, UserRepository],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
