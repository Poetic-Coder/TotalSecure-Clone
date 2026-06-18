import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryProvider } from './cloudinary.provider';
import { CLOUDINARY } from './constants';

describe('Cloudinary', () => {
  let provider: typeof CloudinaryProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudinaryProvider],
      imports: [ConfigModule],
    })
      .overrideProvider(CLOUDINARY)
      .useValue({})
      .compile();

    provider = module.get<typeof CloudinaryProvider>(CLOUDINARY);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
