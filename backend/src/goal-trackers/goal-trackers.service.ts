import api from 'helpers/api';
import * as moment from 'moment';
import { Model } from 'mongoose';
import * as QueryString from 'qs';
import { ConnectionsService } from 'src/connections/connections.service';
import { FinancesService } from 'src/finances/finances.service';
import { RewardsService } from 'src/rewards/rewards.service';

import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { CreateGoalTrackerDto } from './dto/create-goal-tracker.dto';
import { GoalTracker } from './goal-trackers.schema';

@Injectable()
export class GoalTrackersService {
  private ringCentralApiEndpoint = process.env.RINGCENTRAL_API_ENDPOINT;

  constructor(
    @InjectModel(GoalTracker.name) private trackerModel: Model<GoalTracker>,
    private connectionService: ConnectionsService,
    private financesService: FinancesService,
    private rewardService: RewardsService,
  ) {}

  private getAchieves(tracker) {
    let isSalesAchieved: boolean | null =
      tracker.achieved.sales >= tracker.goals.sales;
    let isCallsAchieved: boolean | null =
      tracker.achieved.calls >= tracker.goals.calls;

    // check if both or either sales or calls is achieved
    let achieved = false;
    if (isSalesAchieved && isCallsAchieved) achieved = true;

    // if there is no goals for sales or calls, then return null
    if (tracker.goals.sales == 0) isSalesAchieved = null;
    if (tracker.goals.calls == 0) isCallsAchieved = null;

    return {
      sales: isSalesAchieved,
      calls: isCallsAchieved,
      both: achieved,
    };
  }

  private async trackSales(userId: string, unixMin: number, unixMax: number) {
    let invoices = await this.financesService.getInvoicesFormatted(
      userId,
      unixMin,
      unixMax,
    );
    // append invoices from connected accounts
    const stripeAccounts = await this.financesService.getInvoicesFormatted(
      userId,
      unixMin,
      unixMax,
      true,
    );
    // merge array but prevent duplicate invoices defined by created
    invoices = invoices.concat(
      stripeAccounts.filter(
        ({ created }) =>
          invoices.filter((invoice) => invoice.created == created).length == 0,
      ),
    );

    const whitelabels = await this.financesService.getWhitelabelTags();
    const whitelabel = whitelabels.whitelabel_by_id[userId];

    const userInvoices = invoices.filter(
      ({ builderName }) => builderName === whitelabel,
    );

    return userInvoices.length;
  }

  // track ringcentral calls
  private async trackCalls(userId: string, unixMin: number, unixMax: number) {
    // https://platform.devtest.ringcentral.com/
    const connection = await this.connectionService.findMyConnection(
      userId,
      'ringcentral',
      false,
    );
    const params = QueryString.stringify({
      recordCount: 300,
      type: 'Voice',
      direction: 'Outbound',
      view: 'Simple',
      withRecording: false,
      dateFrom: moment.unix(unixMin).toISOString(),
      dateTo: moment.unix(unixMax).toISOString(),
    });
    const callsLog = await api
      .get(
        this.ringCentralApiEndpoint +
          '/restapi/v1.0/account/~/call-log-sync?' +
          params,
        {
          headers: {
            Authorization: `Bearer ${connection?.token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )
      .then(({ data }) => data)
      .catch((e) => {
        console.log({ trackCallsError: e });
        return 0;
      });
    return callsLog?.records?.length || 0;
  }

  async create(body: CreateGoalTrackerDto) {
    // if either sales or calls is not provided OR it's 0, throw an error
    if ((!body.sales && !body.calls) || (body.sales == 0 && body.calls == 0)) {
      throw new BadRequestException('Either sales or calls must be provided');
    }
    // check if user has an existing goal tracker
    // if it exists, throw an error
    // also if the tracker is expired but isUserReset is false, throw an error
    const existingGoalTracker = await this.trackerModel.findOne({
      user: body.user,
      $or: [{ expiresAt: { $gt: moment().unix() } }, { isUserReset: false }],
    });
    if (existingGoalTracker) {
      throw new UnauthorizedException(
        `You already have an existing goal tracker.`,
      );
    }
    const data = {
      ...body,
      goals: {
        sales: Number(body.sales),
        calls: Number(body.calls),
      },
      achieved: {
        sales: 0,
        calls: 0,
      },
      expiresAt: moment().add(12, 'hours').unix(),
    };
    const goalTracker = new this.trackerModel(data);
    await goalTracker.save();

    return body;
  }

  async claimReward(userId: string, id: string) {
    // check if user is allowed to claim reward
    const reward = await this.rewardService.check({
      name: `gt-${id}-reached`,
      user: userId,
    });
    if (reward?.type === 'claimed') {
      throw new BadRequestException('You have already claimed this reward');
    }
    if (reward?.type === 'no_permission') {
      throw new BadRequestException('You are not allowed to claim this reward');
    }
    // create claimed reward
    const claimReward = await this.rewardService.sendReward(
      userId,
      `gt-${id}-reached`,
    );
    if (!claimReward) {
      throw new BadRequestException('You are not allowed to claim this reward');
    }

    // update goal tracker
    const goalTracker = await this.trackerModel.findOneAndUpdate(
      { _id: id },
      { isRewardClaimed: true, isUserReset: true, expiresAt: moment().unix() },
    );

    return goalTracker;
  }

  async findAllUserTrackers(userId: number) {
    // get user passed trackers
    const goalTrackers = await this.trackerModel
      .find({
        user: userId,
        $or: [{ expiresAt: { $lt: moment().unix() } }, { isUserReset: true }],
      })
      .sort({ createdAt: -1 });
    if (!goalTrackers) {
      throw new BadRequestException('You do not have any goal trackers');
    }

    return goalTrackers;
  }

  async findMyActiveTracker(userId: number) {
    const params = {
      user: userId,
      $or: [{ expiresAt: { $gt: moment().unix() } }, { isUserReset: false }],
    };
    // get tracker if its still active OR not reset by user
    let goalTracker = await this.trackerModel.findOne(params);

    if (!goalTracker) {
      // throw new BadRequestException('You do not have an active goal tracker');
      return null;
    }

    // if achieved sales is bellow the goal sales, check user sales
    if (goalTracker?.achieved?.sales < goalTracker?.goals?.sales) {
      // check sales
      const sales = await this.trackSales(
        userId.toString(),
        goalTracker.createdAt,
        goalTracker?.expiresAt,
      );
      const body = {
        ...goalTracker.toJSON(),
        achieved: {
          ...goalTracker.achieved,
          sales,
        },
      };
      // update sales
      await this.trackerModel.updateOne({ _id: goalTracker._id }, body);
    }
    // if achieved calls is bellow the goal calls, check user calls
    if (goalTracker?.achieved?.calls < goalTracker?.goals?.calls) {
      // check calls
      const calls = await this.trackCalls(
        userId.toString(),
        goalTracker.createdAt,
        goalTracker?.expiresAt,
      );
      const body = {
        ...goalTracker.toJSON(),
        achieved: {
          ...goalTracker.achieved,
          calls,
        },
      };
      // update calls
      await this.trackerModel.updateOne({ _id: goalTracker._id }, body);
      goalTracker = await this.trackerModel.findOne(params);
    }

    // check if tracker is achieved
    const achieves = this.getAchieves(goalTracker);
    if (achieves.both && !goalTracker?.reward) {
      const salesReward = 3.5;
      const callsReward = 0.07; // it's from 100 calls = 7$HSL
      // calculate reward
      const reward =
        salesReward * (goalTracker.goals.sales || 0) +
        callsReward * (goalTracker.goals.calls || 0);
      // create reward
      const rewardObj = await this.rewardService.create({
        name: `gt-${goalTracker._id}-reached`,
        amount: reward,
        reference: 'goal-tracker',
        description:
          'You reached your daily goal! You’re crushin’ it! Keep up the hard work and here’s [x] $HSL',
        claimableBy: userId.toString(),
      });
      // update tracker
      await this.trackerModel.updateOne(
        { _id: goalTracker._id },
        { reward: rewardObj._id },
      );
      goalTracker = await this.trackerModel.findOne(params);
    }

    return goalTracker;
  }

  async resetActiveTracker(userId: number) {
    // get tracker if its still active OR not reset by user
    const goalTracker = await this.trackerModel.findOne({
      user: userId,
      $or: [{ expiresAt: { $gt: moment().unix() } }, { isUserReset: false }],
    });
    if (!goalTracker) {
      throw new BadRequestException('You do not have an active goal tracker');
    }
    // reset tracker
    goalTracker.isUserReset = true;
    goalTracker.expiresAt = moment().unix();
    await goalTracker.save();

    return goalTracker;
  }

  async trackerGrowth(userId: number) {
    // get tracker if its still active OR not reset by user
    const trackers = await this.findAllUserTrackers(userId);
    // return a response to match array for line chart
    // collect data by month then return to match array for line chart, this should be like this format
    // [1,2,3,4,5,6,7,8,9,10,11]
    // while each index means the month
    // and the value is the total achieved sales or calls for that month
    // it should be also grouped by month in a year
    const data = [];
    const currentYear = moment().year();
    for (let i = 0; i < 12; i++) {
      const month = moment().month(i).format('MMMM');
      const monthData = {
        month,
        reached: 0,
        unreached: 0,
        calls: 0,
        sales: 0,
      };
      trackers.forEach((tracker) => {
        // make sure the expiresAt is in the current year
        if (moment.unix(tracker.expiresAt).year() != currentYear) return;
        const trackerMonth = moment.unix(tracker.expiresAt).month();
        const trackerYear = moment.unix(tracker.expiresAt).year();
        if (trackerMonth == i && trackerYear == currentYear) {
          monthData.reached += this.getAchieves(tracker).both ? 1 : 0;
          monthData.unreached += this.getAchieves(tracker).both ? 0 : 1;
          monthData.calls += tracker.achieved.calls;
          monthData.sales += tracker.achieved.sales;
        }
      });
      data.push(monthData);
    }
    return data;
  }
}
