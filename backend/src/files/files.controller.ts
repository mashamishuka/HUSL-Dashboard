import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Res,
  HttpStatus,
  Request,
  Get,
  UseGuards,
  Patch,
  Delete,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { UpdateFileDto } from './dto/update-file.dto';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto,
    @Request() req,
    @Res() res: Response,
  ) {
    const userId = req?.user?._id || req?.body?.userId;

    if (userId) {
      uploadFileDto.user = userId;
    }

    try {
      const uploadedFile = await this.filesService.upload({
        file,
        ...uploadFileDto,
      });

      return res.status(HttpStatus.CREATED).json({
        data: uploadedFile,
        message: 'File uploaded successfully.',
        status: HttpStatus.CREATED,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        data: null,
        message: error?.response?.message || error?.message,
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('folderTree')
  async getFolderTree(@Request() req, @Res() res: Response) {
    try {
      const user = (req?.user as any)?._id;
      const folderTree = await this.filesService.folderTree({
        ...req?.query,
        user,
      });

      return res.status(HttpStatus.OK).json({
        data: folderTree,
        message: 'Folder tree fetched successfully.',
        status: HttpStatus.OK,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        data: null,
        message: error?.response?.message || error?.message,
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('folder')
  async deleteFolder(@Request() req, @Res() res: Response) {
    try {
      const user = (req?.user as any)?._id;
      const key = req?.query?.key;
      const folderTree = await this.filesService.deleteFolder({
        folder: key,
        user,
      });

      return res.status(HttpStatus.OK).json({
        data: folderTree,
        message: 'Folder deleted successfully.',
        status: HttpStatus.OK,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        data: null,
        message: error?.response?.message || error?.message,
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('folder')
  async createFolder(
    @Request() req,
    @Res() res: Response,
    @Body() createFolderDto: CreateFolderDto,
  ) {
    try {
      const createdBy = (req?.user as any)?._id;
      let path = `${createdBy}/${createFolderDto?.path || ''}`;
      const folderName = createFolderDto?.folderName || 'New Folder';
      if (folderName) {
        path = `${path}${folderName}`;
      }
      const folderTree = await this.filesService.createFolder(path);

      return res.status(HttpStatus.CREATED).json({
        data: folderTree,
        message: 'Folder created successfully.',
        status: HttpStatus.CREATED,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        data: null,
        message: error?.response?.message || error?.message,
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async updateFile(
    @Request() req,
    @Res() res: Response,
    @Body() updateFileDto: UpdateFileDto,
  ) {
    try {
      const createdBy = (req?.user as any)?._id;

      const oldKey = updateFileDto?.oldKey ? `/${updateFileDto?.oldKey}` : '';
      // new key
      const key = updateFileDto?.key ? `/${updateFileDto?.key}` : '';

      const file = await this.filesService.updateFile(
        createdBy + oldKey,
        createdBy + key,
      );

      return res.status(HttpStatus.OK).json({
        data: file,
        message: 'File updated successfully.',
        status: HttpStatus.OK,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        data: null,
        message: error?.response?.message || error?.message,
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('folder')
  async updateFolder(
    @Request() req,
    @Res() res: Response,
    @Body() updateFolderDto: UpdateFolderDto,
  ) {
    try {
      const createdBy = (req?.user as any)?._id;
      // new path folder
      let path = updateFolderDto?.path ? `/${updateFolderDto?.path}` : '';
      // full path of current folder
      const key = updateFolderDto?.key ? `/${updateFolderDto?.key}` : '';
      // rename folder
      const folderName = updateFolderDto?.folderName || 'New Folder';
      if (folderName) {
        path = createdBy + `${path}/${folderName}`;
      }
      const folderTree = await this.filesService.updateFolder(
        createdBy + key,
        path,
      );

      return res.status(HttpStatus.CREATED).json({
        data: folderTree,
        message: 'Folder created successfully.',
        status: HttpStatus.CREATED,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        data: null,
        message: error?.response?.message || error?.message,
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('batch')
  async deleteFiles(@Request() req, @Res() res: Response) {
    try {
      const createdBy = (req?.user as any)?._id;
      const keys = req?.body?.keys?.map((key) => createdBy + '/' + key);

      const files = await this.filesService.deleteFiles(keys);

      return res.status(HttpStatus.OK).json({
        data: files,
        message: 'Files deleted successfully.',
        status: HttpStatus.OK,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        data: null,
        message: error?.response?.message || error?.message,
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':key')
  async deleteFile(@Request() req, @Res() res: Response) {
    try {
      const createdBy = (req?.user as any)?._id;
      let key = req?.params?.key;
      const folder = req?.query?.folder;
      if (folder) {
        key = `${folder}/${key}`;
      }
      const file = await this.filesService.deleteFile(createdBy + '/' + key);

      return res.status(HttpStatus.OK).json({
        data: file,
        message: 'File deleted successfully.',
        status: HttpStatus.OK,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        data: null,
        message: error?.response?.message || error?.message,
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }
}
