import { FileValidator, ParseFilePipe, UseInterceptors, ParseFilePipeBuilder, HttpStatus } from '@nestjs/common';
import { UploadedFile as UploadedFileDecorator } from '@nestjs/common';
import { UploadedFiles as UploadedFilesDecorator } from '@nestjs/common';
import { ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { v1 as uuidv1 } from 'uuid';
import { MAX_UPLOAD, MAX_UPLOAD_SIZE, UPLOAD_DIR } from '@common/constants';
import { applyDecorators } from '@nestjs/common';


class MaxFileSize extends FileValidator<{ maxSize: number }>{
  constructor(options: { maxSize: number }) {
    super(options)
  }

  isValid(file: Express.Multer.File): boolean | Promise<boolean> {
    const in_mb = file.size / 1000000
    return in_mb <= this.validationOptions.maxSize
  }
  buildErrorMessage(): string {
    return `File uploaded is too big. Max size is (${this.validationOptions.maxSize} MB)`
  }
}

const validators = ({ required }: { required?: boolean }) => [
  new ParseFilePipe({
    validators: [
      new MaxFileSize({
        maxSize: MAX_UPLOAD_SIZE
      }),
    ],
    fileIsRequired: required == undefined ? true : false
  }),
  new ParseFilePipeBuilder()
    .addFileTypeValidator({
      fileType: /(jpg|jpeg|png|gif|pdf|doc|docx|txt)$/,
    })
    .build({
      fileIsRequired: required == undefined ? true : false
    })
]


const csvValidators = ({ required }: { required?: boolean }) => [
  new ParseFilePipeBuilder()
    .addFileTypeValidator({
      fileType: 'csv'
    })
    .build({
      fileIsRequired: required == undefined ? true : false
    })
]


export type UploadOptions = {
  required?: boolean
}

export const UploadedFiles = ({ required }: UploadOptions = {}) => UploadedFilesDecorator(...validators({ required }))
export const UploadedFile = ({ required }: UploadOptions = {}) => UploadedFileDecorator(...validators({ required }))
export const FileUploaded = () => UploadedFileDecorator(...csvValidators({ required: true }))

export const defaultConfig = diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    cb(null, `${uuidv1()}${path.extname(file.originalname)}`)
  }
})

export const MultipartBody = () => ApiConsumes('multipart/form-data')

export function AcceptFile() {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor('file')
    )
  );
}

export function AcceptMultipleFiles() {
  return applyDecorators(
    UseInterceptors(
      FilesInterceptor('files', MAX_UPLOAD)
    )
  );
}
