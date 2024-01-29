import api from 'helpers/api';
import { Model } from 'mongoose';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notifications } from './notifications.schema';

@Injectable()
export class NotificationsService {
  zapUrl: string;
  constructor(
    @InjectModel(Notifications.name)
    private NotificationsModel: Model<Notifications>,
  ) {
    this.zapUrl = process.env.ZAP_WEBHOOK_REWARD_URL;
  }

  /**
   * send a reward through zapier webhook
   * @param user
   * @param name: name of the reward, it's unique
   */

  async create(createNotificationDto: CreateNotificationDto) {
    try {
      const notification = new this.NotificationsModel(createNotificationDto);
      await notification.save();
      return notification;
    } catch (error) {
      throw new Error(error);
    }
  }

  async delete(id: string) {
    try {
      await this.NotificationsModel.findOneAndDelete({
        _id: id,
      });
      return true;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAll(query?: Record<string, any>) {
    try {
      const notifications = await this.NotificationsModel.find(query).exec();
      // we need to change the description, if there is any [amount] in the description
      const obj = notifications.map((notification) => {
        return {
          ...notification?.toJSON(),
        };
      });

      return obj;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * get Notifications by ID
   * @param ID
   * @returns
   */
  async findNotificationsById(_id?: string) {
    // check if user is allowed to claim Notifications
    const notification = await this.NotificationsModel.find({
      name: { $elemMatch: { value: _id } },
    });
    return notification;
  }

  /**
   * get Notifications by ID
   * @param ID
   * @returns
   */
  async updateNotificationStatusById(_id?: string) {
    // check if user is allowed to claim Notifications
    const notification = await this.NotificationsModel.findOneAndUpdate(
      { _id },
      { $set: { status: true } },
      { new: true },
    );

    return notification;
  }
}
