import { integer } from 'aws-sdk/clients/cloudfront';
import * as moment from 'moment';
import mongoose, { Model } from 'mongoose';
import { Business } from 'src/businesses/businesses.schema';
import { Niche } from 'src/niches/niches.schema';
import { User } from 'src/users/users.schema';

import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Purchase, PurchaseDocument } from './purchases.schema';

const ObjectId = mongoose.Types.ObjectId;
const Web3 = require('web3');
const stripe = require('stripe')(
  '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',
);

// real Husl USD (USDH) contract address
// const ADDRESS_CONTRACT = '0x7BAB3781D9A238CdeA4f4925f9322C5a73f9C8cd';

// it's USDC. Switched by customer request (issues with Husl USD (USDH))
const ADDRESS_CONTRACT = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

const ADDRESS_OWNER = '0xaCBb3587a13239942D9B81db1d6874F9b06c88cB';

const rpcAddress =
  'https://mainnet.infura.io/v3/d044127f59224a2aa4d6e258b0551402';
const web3 = new Web3(rpcAddress);

const REGEX_TX_HASH = new RegExp(/^0x[0-9a-f]{64}$/);

async function call_zapier_webhook(url: string, data: Record<string, any>) {
  // form data payload
  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    // form data
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify(data),
  }).then((response) => response.json());
  return response;
}

function validate_transaction_hash(tx_hash: string) {
  if (!REGEX_TX_HASH.test(tx_hash)) {
    throw new Error(
      'Value of parameter transaction_hash is not a transaction hash',
    );
  }
}

function require_user_is_purchase_owner(
  user_id: string,
  purchase_owner: string,
) {
  if (purchase_owner !== user_id) {
    throw new HttpException('You are not the owner of this purchase', 403);
  }
}

@Injectable()
export class PurchasesService {
  constructor(
    @InjectModel(Purchase.name) private purchaseModel: Model<Purchase>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async is_usdh_payment_complete(tx_hash: string) {
    if (!tx_hash) {
      return false;
    }
    const receipt = await web3.eth.getTransactionReceipt(tx_hash);
    // console.log(receipt);
    return receipt !== null;
  }

  async is_stripe_payment_complete(payment_intent_id: string) {
    const payment_intent =
      await stripe.paymentIntents.retrieve(payment_intent_id);
    // console.log("Payment status: " + payment_intent.status);
    return payment_intent.status === 'succeeded';
  }

  async determine_stripe_subscription_state(checkout_session_id: string) {
    const session =
      await stripe.checkout.sessions.retrieve(checkout_session_id);
    if (session.status === 'complete') {
      return 'completed';
    }
    if (session.status === 'expired') {
      return 'aborted';
    }
    return 'pending';
  }

  async verify_usdh_transaction(
    transaction_hash: string,
    required_amount: string,
  ) {
    const receipt = await web3.eth.getTransactionReceipt(transaction_hash);

    if (receipt.to !== ADDRESS_CONTRACT.toLowerCase()) {
      throw new Error('amount sent via incorrect ERC20 contract (not USDH)');
    }

    // TODO security check: could an attacker include the address as topic without sending the exact amount
    if (
      !receipt.logs[0].topics.includes(
        '0x000000000000000000000000' + ADDRESS_OWNER.toLowerCase().substring(2),
      )
    ) {
      throw new Error('amount sent to wrong address');
    }

    function stringify_number(x: number) {
      return x.toLocaleString('fullwide', { useGrouping: false });
    }

    const amount_sent = stringify_number(parseInt(receipt.logs[0].data, 16));

    if (BigInt(amount_sent) !== BigInt(required_amount)) {
      throw new Error(
        'incorrect amount sent (' +
          amount_sent +
          ' !== ' +
          required_amount +
          ')',
      );
    }

    if (!receipt.status) {
      throw new Error('transaction did not confirm');
    }
  }

  async determine_purchase_state(purchase: Purchase) {
    if (purchase.is_stripe_not_usdh) {
      return await this.determine_stripe_purchase_state(purchase);
    } else {
      return await this.determine_usdh_purchase_state(purchase);
    }
  }

  async determine_usdh_purchase_state(purchase: Purchase) {
    const is_complete = await this.is_usdh_payment_complete(purchase.tx_hash);
    return is_complete ? 'completed' : 'pending';
  }

  async determine_stripe_purchase_state(purchase: Purchase) {
    if (purchase.subscription_session) {
      return await this.determine_stripe_subscription_state(
        purchase.subscription_session.id,
      );
    } else {
      const is_complete = await this.is_stripe_payment_complete(
        purchase.payment_intent.id,
      );
      return is_complete ? 'completed' : 'pending';
    }
  }

  async require_purchase(purchase_id: string): Promise<Purchase> {
    const purchase: PurchaseDocument = await this.purchaseModel.findOne({
      _id: new ObjectId(purchase_id),
    });
    if (purchase) {
      return purchase;
    } else {
      throw new HttpException('Purchase ' + purchase_id + ' not found', 404);
    }
  }

  random_object_id() {
    return new ObjectId();
  }

  async update(purchase_id: string) {
    try {
      const purchase: Purchase = await this.require_purchase(purchase_id);
      if (purchase.state === 'pending') {
        const new_state = await this.determine_purchase_state(purchase);
        // if(new_state === 'completed') {
        //   // trigger zapier webhook
        //   // const user = await this.userModel
        //   // const body = {
        //   //   business_name: purchase.name
        //   // }
        // }
        if (new_state !== 'pending') {
          // console.log("setting purchase " + purchase_id + " to " + new_state);
          await this.update_purchase_state(purchase, new_state);
        }
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async add_subscription_id_to_purchase(
    subscription_id: string,
    purchase_id: string,
  ) {
    await this.purchaseModel.updateOne(
      {
        _id: new ObjectId(purchase_id),
      },
      {
        $set: {
          subscription_id,
        },
      },
    );
  }

  async find_purchase_for_subscription(
    subscription_id: string,
    timestamp_start: number,
  ) {
    if (!subscription_id) {
      throw new Error('subscription_id unset');
    }

    const document = await this.purchaseModel.findOne({
      subscription_id,
    });
    if (document) {
      document.subscription_session = undefined;
      return document;
    } else {
      const potential_purchases = await this.purchaseModel.find({
        created: { $gt: timestamp_start - 3600, $lt: timestamp_start + 3600 },
        is_stripe_not_usdh: true,
      });
      for (const potential_purchase of potential_purchases) {
        const subscription_session_id =
          potential_purchase.subscription_session?.id;
        if (subscription_session_id) {
          const session = await stripe.checkout.sessions.retrieve(
            subscription_session_id,
          );
          if (session.subscription === subscription_id) {
            await this.add_subscription_id_to_purchase(
              subscription_id,
              potential_purchase._id.toString(),
            );
            potential_purchase.subscription_session = undefined;
            return potential_purchase;
          }
        }
      }
      return null;
    }
  }

  async get_all_active_subscriptions(
    stripe_price_id: string,
    params: Record<string, any> = {},
  ) {
    const subscriptions = await stripe.subscriptions
      .list({
        status: 'active',
        price: stripe_price_id, // "price_1MFPAGCOIb8tHxq5WuDeEww9",
        limit: 100,
        ...params,
      })
      .then((result: any) => result.data);
    // TODO this will only fetch 100, fetch more
    const active_subscriptions = [];
    for (const subscription of subscriptions) {
      const { id: subscription_id, start_date: timestamp_start } = subscription;
      const purchase = await this.find_purchase_for_subscription(
        subscription_id,
        timestamp_start,
      );
      if (purchase) {
        active_subscriptions.push(purchase);
      }
    }
    return active_subscriptions;
  }

  async update_purchase_state(
    purchase: Purchase,
    state: string,
    set: Record<string, any> = {},
  ) {
    set['state'] = state;
    await this.update_purchase(purchase._id.toHexString(), set);
    if (state === 'completed') {
      await this.notify_zapier_on_purchase_completion(purchase);
    }
  }

  async update_purchase(purchase_id: string, set: Record<string, any> = {}) {
    await this.purchaseModel.updateOne(
      { _id: new ObjectId(purchase_id) },
      {
        $set: set,
      },
    );
  }

  async get_subscription_status_of_purchase(purchase_id: string) {
    const purchase = await this.require_purchase(purchase_id);
    if (!purchase.subscription_session) {
      throw new HttpException(
        'Purchase ' + purchase_id + ' is not a subscription',
        404,
      );
    }
    const subscription_session_id = purchase.subscription_session.id;
    const subscription_session = await stripe.checkout.sessions.retrieve(
      subscription_session_id,
    );
    if (subscription_session.status != 'complete') {
      throw new HttpException(
        'Subscription session ' + subscription_session_id + ' is not complete',
        404,
      );
    }
    const subscription_id = subscription_session.subscription;
    const subscription = await stripe.subscriptions.retrieve(subscription_id);
    return subscription.status;
  }

  async add_transaction_hash(
    purchase_id: string,
    userId: string,
    tx_hash: string,
  ) {
    try {
      const purchase: Purchase = await this.require_purchase(purchase_id);
      validate_transaction_hash(tx_hash);
      require_user_is_purchase_owner(userId, purchase.user);

      let state = null;
      let note = null;

      try {
        await this.verify_usdh_transaction(
          tx_hash,
          purchase.price + '0000000000000000',
        );
        state = 'completed';
      } catch (error) {
        state = 'failed';
        note = error.message;
      }

      await this.update_purchase_state(purchase, state, { tx_hash, note });
    } catch (error) {
      throw new Error(error);
    }
  }

  async notify_zapier_about_subscription_status(
    purchase: Purchase,
    is_subscribed: boolean,
  ) {
    const webhook = 'https://hooks.zapier.com/hooks/catch/11801412/36blgep/';
    let user = await this.userModel.findOne({
      _id: new ObjectId(purchase?.user),
    });
    // populate business and its niche
    user = await user.populate({
      path: 'business',
      model: Business.name,
      populate: {
        path: 'niche',
        model: Niche.name,
      },
    });
    const data = {
      business_name: user?.name,
      item: 'Organic Growth',
      user_id: purchase?.user,
      date_subscribed: moment.unix(purchase?.created).format('LL LT'),
      business_niche: user?.business?.[0]?.niche?.name,
      business_domain: user?.productUrl,
      status: is_subscribed ? 'start' : 'stop',
    };
    await call_zapier_webhook(webhook, data);
  }

  async notify_zapier_about_flatrate_purchase(
    customers: integer,
    user_id: string,
    repetition?: string,
  ) {
    const webhook = 'https://hooks.zapier.com/hooks/catch/11801412/36blgep/';
    let user = await this.userModel.findOne({
      _id: new ObjectId(user_id),
    });
    // populate business and its niche
    user = await user.populate({
      path: 'business',
      model: Business.name,
      populate: {
        path: 'niche',
        model: Niche.name,
      },
    });
    const data = {
      business_name: user?.name,
      item: 'Guaranteed Customers',
      user_id: user?._id?.toString(),
      date_subscribed: moment().format('LL LT'),
      business_niche: user?.business?.[0]?.niche?.name,
      business_domain: user?.productUrl,
      customers,
      repitition: repetition || 'once',
    };
    await call_zapier_webhook(webhook, data);
  }

  async notify_zapier_on_purchase_completion(purchase: Purchase) {
    if (purchase.name === 'subscription') {
      await this.notify_zapier_about_subscription_status(purchase, true);
    } else if (purchase.name === 'flatrate') {
      await this.notify_zapier_about_flatrate_purchase(
        purchase.data?.quantity || purchase['customers'],
        purchase.user,
        purchase.data?.repitition,
      );
    }
  }

  async findAll(query?: Record<string, any>) {
    try {
      const data = await this.purchaseModel.find(query);
      const data_with_customers_attribute = data.map((x: any) => {
        if (x.data) {
          x.customers = x.data.quantity;
        }
        return x;
      });
      return data_with_customers_attribute;
    } catch (error) {
      throw new Error(error);
    }
  }

  async insertOne(query?: Record<string, any>) {
    try {
      const data = await this.purchaseModel.insertMany(query);
      return data;
    } catch (error) {
      throw new Error(error);
    }
  }

  async delete(purchase_id: string) {
    try {
      const data = await this.purchaseModel.deleteOne({
        _id: new ObjectId(purchase_id),
        name: 'direct',
      });
      return data;
    } catch (error) {
      throw new Error(error);
    }
  }

  async test() {
    // const testObj = {
    //   _id: '63d2ab0f9bee2f3c0b3b',
    //   name: 'subscription',
    //   user: '6376993381e5b441c135d1f5',
    //   price: 30000,
    //   state: 'completed',
    //   is_stripe_not_usdh: true,
    //   subscription_session: {
    //     id: 'cs_live_a1wxvNxwRmdlz6neJ9jWkRNYJ5ylTO6Kxt4eq6X781ZAkaro02u5NixBzH',
    //     object: 'checkout.session',
    //     after_expiration: null,
    //     allow_promotion_codes: null,
    //     amount_subtotal: 30000,
    //     amount_total: 30000,
    //     automatic_tax: {
    //       enabled: false,
    //       status: null,
    //     },
    //     billing_address_collection: null,
    //     cancel_url:
    //       'https://app.husl.xyz/services?callback_purchase_id=63d2ab0f9bee2f3c0db4f719',
    //     client_reference_id: null,
    //     consent: null,
    //     consent_collection: null,
    //     created: 1674750735,
    //     currency: 'usd',
    //     custom_text: {
    //       shipping_address: null,
    //       submit: null,
    //     },
    //     customer: null,
    //     customer_creation: 'always',
    //     customer_details: null,
    //     customer_email: null,
    //     expires_at: 1674837135,
    //     invoice: null,
    //     invoice_creation: null,
    //     livemode: true,
    //     locale: null,
    //     mode: 'subscription',
    //     payment_intent: null,
    //     payment_link: null,
    //     payment_method_collection: 'always',
    //     payment_method_options: null,
    //     payment_method_types: ['card'],
    //     payment_status: 'unpaid',
    //     phone_number_collection: {
    //       enabled: false,
    //     },
    //     recovered_from: null,
    //     setup_intent: null,
    //     shipping_address_collection: null,
    //     shipping_cost: null,
    //     shipping_details: null,
    //     shipping_options: [],
    //     status: 'open',
    //     submit_type: null,
    //     subscription: null,
    //     success_url:
    //       'https://app.husl.xyz/services?callback_purchase_id=63d2ab0f9bee2f3c0db4f719',
    //     total_details: {
    //       amount_discount: 0,
    //       amount_shipping: 0,
    //       amount_tax: 0,
    //     },
    //     url: 'https://checkout.stripe.com/c/pay/cs_live_a1wxvNxwRmdlz6neJ9jWkRNYJ5ylTO6Kxt4eq6X781ZAkaro02u5NixBzH#fidkdWxOYHwnPyd1blppbHNgWjA0SX9LQEhGSkxnPXFNfXQwSGF%2FazBqSEdHbzNtZmZiamtUYUB2ckQ8dmREMzJqdXRxMlxxXH9VfU9idVR1SVczMjNRSUpncndpM01PdjUwXzFRMlVVMjBrNTVNM0hQUG1tXCcpJ2N3amhWYHdzYHcnP3F3cGApJ2lkfGpwcVF8dWAnPyd2bGtiaWBabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl',
    //   },
    //   data: {
    //     quantity: 1,
    //     stripe_price: 'price_1MFPAGCOIb8tHxq5WuDeEww9',
    //   },
    //   created: 1674750735,
    //   __v: 0,
    //   subscription_id: 'sub_1MUYNgCOIb8tHxq5SrHloreG',
    //   tx_hash:
    //     '0x23bfd594f7186b2446bf0c79e313af8f012fa486bd9132c88d399195e905bbff',
    //   payment_intent: '',
    //   note: '',
    // } as any;
    return;
    // return await this.notify_zapier_about_subscription_status(testObj, true);
    // return await this.notify_zapier_about_flatrate_purchase(
    //   1337,
    //   '6376993381e5b441c135d1f5',
    //   'weekly',
    // );
  }
}
