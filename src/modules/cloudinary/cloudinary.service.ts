import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';


@Injectable()
export class CloudinaryService {
  async uploadFile(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      v2.uploader.upload_stream(
        {
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      ).end(file.buffer)
    })
  }

  async uploadFiles(
    files: Express.Multer.File[],
  ) {
    const urls = await Promise.all(files.map(async (file): Promise<string> => {
      const { secure_url } = await this.uploadFile(file);
      return secure_url;
    }));
    return urls
  }

  async uploadFileFromUrl(
    url: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return v2.uploader.upload(url)
  }

  async uploadFilesFromUrl(
    urls: string[],
  ) {
    return Promise.all(urls.map(async (url: string): Promise<string> => {
      const { secure_url } = await this.uploadFileFromUrl(url);
      return secure_url;
    }));
  }

  async uploadFileFromBase64(
    data: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return v2.uploader.upload(data)
  }

  async uploadRawFileFromBase64(
    data: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return v2.uploader.upload(data, {resource_type: 'raw'})
  }

  async uploadManyBase64(
    files: string[],
  ) {
    const urls = await Promise.all(files.map(async (file): Promise<string> => {
      const { secure_url } = await this.uploadFileFromBase64(file);
      return secure_url;
    }));
    return urls
  }
}
