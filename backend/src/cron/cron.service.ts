import * as archiver from 'archiver';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as moment from 'moment';

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { FilesService } from '../files/files.service';
import { LeaderboardsService } from '../leaderboards/leaderboards.service';

@Injectable()
export class CronService {
  constructor(
    private leaderboardService: LeaderboardsService,
    private fileService: FilesService,
  ) {}

  private async executeCommand(command: string) {
    try {
      const args = command.split(' ');
      const childProcess = spawn(args[0], args.slice(1), { shell: true });
      let output = '';

      childProcess.stdout.on('data', (chunk) => {
        output += chunk.toString();
      });

      await new Promise<void>((resolve, reject) => {
        childProcess.on('exit', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Command '${command}' exited with code ${code}`));
          }
        });

        childProcess.on('error', (err) => {
          reject(err);
        });
      });

      return output.trim();
    } catch (error) {
      console.error(error);
    }
  }

  private async zipFolder(folderPath: string): Promise<string> {
    const zipFilePath = `${folderPath}.zip`;
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip');

    return new Promise((resolve, reject) => {
      output.on('close', () => {
        console.log(`${archive.pointer()} total bytes compressed`);
        resolve(zipFilePath);
      });

      archive.on('warning', (err) => {
        if (err.code === 'ENOENT') {
          console.warn(err);
        } else {
          reject(err);
        }
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);

      archive.directory(folderPath, false);

      archive.finalize();
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'update-leaderboard',
    timeZone: 'America/Los_Angeles',
  })
  async updateLeaderboard() {
    try {
      // await this.leaderboardService.triggerRevenueUpdate();
      Logger.debug('Leaderboard stall');
    } catch (error) {
      Logger.error(error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'daily-backup',
    timeZone: 'America/Los_Angeles',
  })
  async dailyDbBackup() {
    console.info('--- STARTING BACKUP');
    try {
      const path = `backups/mongodb/${moment().format('YYYY-MM-DD')}`;
      const command = `mongodump --uri "mongodb+srv://aldycavalera:Botay26..@cluster0.ta10zcp.mongodb.net/test" -o "${path}"`;
      const output = await this.executeCommand(command);
      // get path of backup, and compress to zip
      const zipFilePath = await this.zipFolder(path);
      // upload to s3
      const s3 = this.fileService.s3Config();
      fs.readFile(zipFilePath, function (err, data) {
        if (err) throw err;
        // Upload file to S3 bucket
        const uploadParams = {
          Bucket: 'husl-admin',
          Key: `${path}.zip`,
          Body: data,
        };
        s3.upload(uploadParams, function (error, result) {
          if (error) throw error;
          console.log(`File uploaded successfully to ${result.Location}`);
        });
      });
      // const upload = await this.fileService.uploadBackup({
      //   file,
      //   filename: `backups/mongodb/${moment().format('YYYY-MM-DD')}`,
      //   bucket: 'husl-admin',
      // });
      // console.log(upload);

      Logger.debug(output);
    } catch (error) {
      console.error(error);
    }
  }
}
