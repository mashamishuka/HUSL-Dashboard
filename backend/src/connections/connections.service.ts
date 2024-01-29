import api from 'helpers/api';
import * as moment from 'moment';
import { Model } from 'mongoose';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Connection } from './connections.schema';
import { GetRingcentralTokenDto } from './dto/get-ringcentral-token.dto';

@Injectable()
export class ConnectionsService {
  private basicAuth = Buffer.from(
    `${process.env.RINGCENTRAL_CLIENT_ID}:${process.env.RINGCENTRAL_CLIENT_SECRET}`,
  ).toString('base64');
  private ringCentralApiEndpoint = process.env.RINGCENTRAL_API_ENDPOINT;
  private ringCentralBasicAuth = {
    Authorization: `Basic ${this.basicAuth}`,
  };

  constructor(
    @InjectModel(Connection.name) private connectionModel: Model<Connection>,
  ) {}

  async authRingCentralToken(userId: string, body: GetRingcentralTokenDto) {
    const authBody = {
      grant_type: 'authorization_code',
      code: body.code,
      redirect_uri: body.redirect_uri,
    };

    const login = await api
      .post(this.ringCentralApiEndpoint + '/restapi/oauth/token', authBody, {
        headers: {
          ...this.ringCentralBasicAuth,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      .then(({ data }) => data)
      .catch((e) => {
        console.log({ e });
        throw new Error(e?.response?.data?.error_description);
        // throw new Error
      });
    // create or update connection
    const connection = await this.connectionModel.findOneAndUpdate(
      { user: userId, appName: 'ringcentral' },
      {
        user: userId,
        appName: 'ringcentral',
        token: login?.access_token,
        refreshToken: login?.refresh_token,
        expiresIn: login?.expires_in,
        refreshTokenExpiresIn: login?.refresh_token_expires_in,
        grantedAt: moment().unix(),
      },
      { upsert: true, new: true },
    );
    return connection;
  }

  async findMyConnection(
    userId: string,
    connection: string,
    privateRss = true,
  ) {
    let connections = this.connectionModel.findOne({
      user: userId,
      appName: connection,
    });

    if (privateRss) {
      connections = connections.select(['-refreshToken', '-token']).lean();
    }
    const connectionRes = await connections.exec();

    const expires = connectionRes.grantedAt + connectionRes.expiresIn;
    // if token is expired, refresh token
    if (expires < moment().unix()) {
      const newConnection = (
        await this.swapRefreshToken(userId, connection)
      ).toObject();
      // if privateRes, remove refreshToken and token
      if (privateRss) {
        delete newConnection.refreshToken;
        delete newConnection.token;
      }
      return newConnection;
    }
    return connectionRes;
  }

  async swapRefreshToken(userId: string, connection: string) {
    const connectionData = await this.connectionModel.findOne({
      user: userId,
      appName: connection,
    });
    const authBody = {
      grant_type: 'refresh_token',
      refresh_token: connectionData.refreshToken,
    };
    const login = await api
      .post(this.ringCentralApiEndpoint + '/restapi/oauth/token', authBody, {
        headers: {
          ...this.ringCentralBasicAuth,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      .then(({ data }) => data)
      .catch((e) => {
        console.log({ e });
        throw new Error(e?.response?.data?.error_description);
        // throw new Error
      });
    // create or update connection
    const newConnection = await this.connectionModel.findOneAndUpdate(
      { user: userId, appName: connection },
      {
        user: userId,
        appName: connection,
        token: login?.access_token,
        refreshToken: login?.refresh_token,
        expiresIn: login?.expires_in,
        refreshTokenExpiresIn: login?.refresh_token_expires_in,
        grantedAt: moment().unix(),
      },
      { upsert: true, new: true },
    );
    return newConnection;
  }

  findOne(id: number) {
    return `This action returns a #${id} connection`;
  }

  remove(id: number) {
    return `This action removes a #${id} connection`;
  }
}
