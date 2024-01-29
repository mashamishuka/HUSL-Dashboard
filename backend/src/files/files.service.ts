import * as AWS from 'aws-sdk';
import * as S3 from 'aws-sdk/clients/s3';
import { randomUUID } from 'crypto';
import { randomString } from 'helpers/common';
import { Model } from 'mongoose';

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { UploadFileDto } from './dto/upload-file.dto';
import { File, FilesDocument } from './files.schema';

@Injectable()
export class FilesService {
  region: string;
  bucket: string;
  endpoint: string;
  constructor(@InjectModel(File.name) private fileModal: Model<FilesDocument>) {
    this.region = process.env.WASABI_REGION || 'us-central-1';
    this.bucket = process.env.WASABI_BUCKET || 'husl-admin';
    this.endpoint = `https://s3.${this.region}.wasabisys.com/${this.bucket}`;
  }

  s3Config() {
    const wasabiEndpoint = new AWS.Endpoint(`s3.${this.region}.wasabisys.com`);

    const s3 = new S3({
      endpoint: wasabiEndpoint,
      region: this.region,
      accessKeyId: process.env.WASABI_ACCESS_KEY_ID,
      secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY,
    });
    return s3;
  }

  async findOne(id: string) {
    return await this.fileModal.findById(id);
  }

  async upload(uploadFile: UploadFileDto) {
    try {
      if (!uploadFile?.file || !uploadFile?.file?.size) {
        throw new BadRequestException('Please select a file.');
      }
      let filename =
        uploadFile?.filename || uploadFile.file?.originalname || randomUUID();
      // get ext from filename
      const ext = filename?.split('.')?.pop();
      // get filename without ext
      filename = filename?.replace(`.${ext}`, '');

      if (uploadFile?.user) {
        filename = `${uploadFile?.user}/${filename}-${randomString(4)}.${ext}`;
      } else {
        filename = `public/${filename}-${randomString(4)}.${ext}`;
      }
      const s3 = this.s3Config();

      const bucket = uploadFile?.bucket || this.bucket;

      let error;
      const fileUpload = await s3
        .putObject(
          {
            Body: uploadFile?.file?.buffer,
            Bucket: bucket,
            Key: filename,
            ACL: 'public-read',
          },
          (err) => {
            if (err) {
              error = err;
            }
          },
        )
        .promise();
      if (error) {
        throw new BadRequestException(error);
      }
      const data = {
        bucket,
        ETag: fileUpload?.ETag,
        key: filename,
        user: uploadFile?.user || null,
        url: `https://s3.${this.region}.wasabisys.com/${bucket}/${filename}`,
      };

      // insert to file db
      const files = await this.fileModal.create({
        ...data,
      });

      return files;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async uploadBackup(uploadFile: UploadFileDto) {
    try {
      if (!uploadFile?.file || !uploadFile?.file?.size) {
        throw new BadRequestException('Please select a file.');
      }
      const filename =
        uploadFile?.filename || uploadFile.file?.originalname || randomUUID();

      const s3 = this.s3Config();

      const bucket = uploadFile?.bucket || this.bucket;

      let error;
      const fileUpload = await s3
        .putObject(
          {
            Body: uploadFile?.file?.buffer,
            Bucket: bucket,
            Key: filename,
            ACL: 'public-read',
          },
          (err) => {
            if (err) {
              error = err;
            }
          },
        )
        .promise();
      if (error) {
        throw new BadRequestException(error);
      }
      const data = {
        bucket,
        ETag: fileUpload?.ETag,
        key: filename,
        user: uploadFile?.user || null,
        url: `https://s3.${this.region}.wasabisys.com/${bucket}/${filename}`,
      };

      // insert to file db
      const files = await this.fileModal.create({
        ...data,
      });

      return files;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  /**
   * Get s3 folder and files tree
   */
  async folderTree(query?: Record<string, any>) {
    const s3 = this.s3Config();

    const search = query?.search;

    let requestObject: S3.ListObjectsV2Request = {
      Bucket: this.bucket,
      Delimiter: '/',
      Prefix: '',
    };
    if (query?.folder) {
      requestObject = {
        ...requestObject,
        // if it's endswith / then no need to add / again
        Prefix: query?.folder?.endsWith('/')
          ? query?.folder
          : `${query?.folder}/`,
      };
    }

    // if there's a user filter, append it to the prefix
    if (query?.user) {
      requestObject = {
        ...requestObject,
        Prefix: `${query?.user}/${requestObject.Prefix}`,
      };
    }

    if (search) {
      requestObject = {
        ...requestObject,
        Prefix: requestObject.Prefix + search,
      };
    }

    let error;
    const data = await s3
      .listObjectsV2(requestObject, (err) => {
        if (err) {
          error = err;
        }
      })
      .promise();
    if (error) {
      throw new BadRequestException(error);
    }
    const folders = data?.CommonPrefixes?.map((item) => ({
      ...item,
      Prefix: item?.Prefix?.replace(requestObject?.Prefix, ''),
    })).filter((item) => item.Prefix !== '/');

    const files = data?.Contents?.map((item) => ({
      ...item,
      Key: item?.Key?.split('/')?.pop(),
      Url: `https://s3.${this.region}.wasabisys.com/${this.bucket}/${item?.Key}`,
    }))
      .filter((file) => file.Size)
      .sort(
        (a, b) =>
          new Date(a.LastModified).getTime() -
          new Date(b.LastModified).getTime(),
      );

    return { folders, files };
  }

  /**
   * Delete s3 folder
   */
  async deleteFolder(query?: Record<string, any>) {
    const folderTree = await this.folderTree(query);
    const files = folderTree.files;
    const folder = folderTree.folders;
    if (!folder.length && !files.length) {
      return 'Nothing to delete.';
    }

    // delete files
    if (files?.length) {
      await Promise.all(
        files.map(async (file) => {
          const key = file.Url?.replace(this.endpoint + '/', '');
          await this.deleteFile(key);
        }),
      );
    }

    if (folder?.length) {
      for (const item of folder) {
        let prefix = item?.Prefix;
        if (prefix?.endsWith('/')) {
          prefix = prefix?.slice(0, -1);
        }
        await this.deleteFolder({
          folder: query?.folder + '/' + prefix,
          user: query?.user,
        });
      }
    }
    return true;
  }

  /**
   * Create s3 folder
   */
  async createFolder(key: string) {
    const s3 = this.s3Config();

    let error;
    const data = await s3
      .putObject(
        {
          Bucket: this.bucket,
          Key: `${key}/`,
        },
        (err) => {
          if (err) {
            error = err;
          }
        },
      )
      .promise();
    if (error) {
      throw new BadRequestException(error);
    }
    return data;
  }

  /**
   * Update s3 folder
   * TODO: BUG - not empty folder can be renamed
   */
  async updateFolder(key: string, newKey: string) {
    const s3 = this.s3Config();

    let error;
    const data = await s3
      .copyObject(
        {
          Bucket: this.bucket,
          CopySource: `${this.bucket}/${key}/`,
          Key: `${newKey}/`,
        },
        (err) => {
          if (err) {
            error = err;
          }
        },
      )
      .promise();
    if (error) {
      throw new BadRequestException(error);
    }
    // remove old folder
    if (data) {
      s3.deleteObject({
        Bucket: this.bucket,
        Key: `${key}/`,
      });
    }
    return data;
  }

  /**
   * Delete s3 folder
   */
  async deleteFile(key: string) {
    const s3 = this.s3Config();

    let error;
    const data = await s3
      .deleteObject(
        {
          Bucket: this.bucket,
          Key: key,
        },
        (err) => {
          if (err) {
            error = err;
          }
        },
      )
      .promise();
    if (error) {
      throw new BadRequestException(error);
    }
    return data;
  }

  /**
   * Delete s3 files
   */
  async deleteFiles(keys: string[]) {
    const s3 = this.s3Config();

    let error;
    const data = await s3
      .deleteObjects(
        {
          Bucket: this.bucket,
          Delete: {
            Objects: keys.map((key) => ({ Key: key })),
          },
        },
        (err) => {
          if (err) {
            error = err;
          }
        },
      )
      .promise();
    if (error) {
      throw new BadRequestException(error);
    }
    return data;
  }

  /**
   * Update s3 file
   */
  async updateFile(key: string, newKey: string) {
    const s3 = this.s3Config();

    let error;
    const data = await s3
      .copyObject(
        {
          Bucket: this.bucket,
          CopySource: `${this.bucket}/${key}`,
          Key: newKey,
        },
        (err) => {
          if (err) {
            error = err;
          }
        },
      )
      .promise();
    if (error) {
      throw new BadRequestException(error);
    }
    // remove old file
    if (data) {
      await s3
        .deleteObject({
          Bucket: this.bucket,
          Key: key,
        })
        .promise();
    }
    return data;
  }
}
