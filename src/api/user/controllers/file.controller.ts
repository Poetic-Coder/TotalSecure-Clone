import { Controller, Logger } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Post } from '@nestjs/common/decorators';
import { UploadDto, UploadMultipleDto } from '../dtos/file.dto';
import { CloudinaryService } from '@modules/cloudinary/cloudinary.service';
import { ApiHeaders } from '@common/decorators/defaultHeaders';

@ApiTags('File Upload')
@Controller('file-upload')
@ApiHeaders()
export class FileController {
  private readonly logger = new Logger(FileController.name);

  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload/single')
  @ApiBody({
    description: 'Upload a single file',
    type: UploadDto,
  })
  @ApiOkResponse({ description: 'Upload file', type: String })
  public async uploadSingleFile(@Body() data: UploadDto) {
    this.logger.log('Uploading file a single file');
    this.logger.log(data.file.substring(0, 10));
    this.logger.log(
      data.file.substring(data.file.length - 20, data.file.length),
    );
    const result = await this.cloudinaryService.uploadFileFromBase64(data.file);
    return result.secure_url;
  }

  @Post('upload-raw/single')
  @ApiBody({
    description: 'Upload a single rawa file',
    type: UploadDto,
  })
  @ApiOkResponse({ description: 'Upload file', type: String })
  public async uploadSingleRawFile(@Body() data: UploadDto) {
    this.logger.log('Uploading file a single file');
    this.logger.log(data.file.substring(0, 10));
    this.logger.log(
      data.file.substring(data.file.length - 20, data.file.length),
    );
    const result = await this.cloudinaryService.uploadRawFileFromBase64(data.file);
    return result.secure_url;
  }

  @Post('upload/multiple')
  @ApiBody({
    description: 'Upload multiple files',
    type: UploadMultipleDto,
  })
  @ApiCreatedResponse({
    description: 'File urls uploaded',
    type: [String],
  })
  public async uploadMultipleFiles(@Body() data: UploadMultipleDto) {
    return await this.cloudinaryService.uploadManyBase64(data.files);
  }
}
