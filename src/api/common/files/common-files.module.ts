import { Module } from '@nestjs/common';
import { CloudinaryModule } from '@modules/cloudinary/cloudinary.module';
import { FileController } from './controllers/file.controller';

@Module({
  imports: [CloudinaryModule],
  controllers: [FileController],
})
export class CommonFilesModule {}
