export class UploadFileDto {
  file: Express.Multer.File;
  filename: string;
  bucket: string;
  user?: string;
}
