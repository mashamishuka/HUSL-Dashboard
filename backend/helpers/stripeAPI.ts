import Stripe from 'stripe';

export const defaultConfig = {
  secretKey: process.env.STRIPE_SECRET_KEY,
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
};

export const stripeConnect = async (
  enableAccount = false,
  config?: Record<string, any>,
) => {
  const stripe = new Stripe(
    config?.secretKey || process.env.STRIPE_SECRET_KEY,
    {
      apiVersion: null,
      stripeAccount:
        enableAccount && config?.isConnected ? config?.stripeUserId : null,
    },
  );
  return stripe;
};

/**
 * Get stripe connected accounts
 */
export const getStripeConnectedAccounts = async (
  config?: StripeConfig,
): Promise<Stripe.Account[]> => {
  try {
    const stripe = await stripeConnect(false, config);
    const accounts = await stripe.accounts
      .list({
        limit: 100,
      })
      .then(({ data }) => data);
    return accounts;
  } catch (error) {
    throw new Error(error);
  }
};

interface StripeConfig {
  secretKey: string;
  publishableKey: string;
  tag?: string;
  stripeUserId?: string;
  isConnected?: boolean;
}
/**
 * Get stripe invoices
 */
type GetStripeRSS<T> = (
  config: StripeConfig,
  args?: {
    unixMin?: number;
    unixMax?: number;
    paid?: boolean;
    useAccount?: boolean;
  },
) => Promise<T>;

export const getStripeInvoices: GetStripeRSS<Stripe.Invoice[]> = async (
  config,
  args,
) => {
  try {
    if (!config?.secretKey || !config?.publishableKey) {
      throw new Error('Stripe configuration invalid.');
    }
    let unixMax = args?.unixMax;
    const paid = args?.paid || true;
    const stripe = await stripeConnect(args?.useAccount, config);

    let invoicesInTimePeriod = [];
    let newInvoices: any[];

    const INVOICES_PER_ITERATION = 100;

    do {
      const params = {
        created: {
          gte: args?.unixMin,
          lte: unixMax,
        },
        limit: INVOICES_PER_ITERATION,
      };
      if (paid) {
        params['status'] = 'paid';
      }
      newInvoices = await stripe.invoices.list(params).then(({ data }) => data);
      invoicesInTimePeriod = invoicesInTimePeriod.concat(newInvoices);
      const timestamps = newInvoices.map(({ created }) => created);
      unixMax = Math.min(...timestamps) - 1;
    } while (newInvoices.length == INVOICES_PER_ITERATION);
    return invoicesInTimePeriod;
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Get stripe subscription
 * @param config
 * @param args
 * @returns
 */
export const getStripeSubscription: GetStripeRSS<
  Stripe.Subscription[]
> = async (config, args) => {
  try {
    const { useAccount, unixMax: maxTime, unixMin } = args;

    const stripe = await stripeConnect(useAccount, config);
    let subscriptionInTimePeriod = [];
    let newSubscriptions: Stripe.Subscription[];
    let unixMax = maxTime;

    const INVOICES_PER_ITERATION = 5;
    do {
      newSubscriptions = await stripe.subscriptions
        .list({
          created: {
            gte: unixMin,
            lte: unixMax,
          },
          limit: INVOICES_PER_ITERATION,
          status: 'all',
        })
        .then(({ data }) => data);
      subscriptionInTimePeriod =
        subscriptionInTimePeriod.concat(newSubscriptions);
      const timestamps = newSubscriptions.map(({ created }) => created);
      unixMax = Math.min(...timestamps) - 1;
    } while (newSubscriptions.length == INVOICES_PER_ITERATION);
    return subscriptionInTimePeriod;
  } catch (error) {
    throw new Error(error);
  }
};

export const getStripeCustomers: GetStripeRSS<Stripe.Customer[]> = async (
  config,
  { unixMax, unixMin },
) => {
  try {
    const stripe = await stripeConnect(false, config);
    // console.log({ config });
    let customersInTimePeriod = [];
    let customers: Stripe.Customer[];

    const LIMIT_PER_ITERATION = 50;
    do {
      customers = await stripe.customers
        .list({
          created: {
            gte: unixMin,
            lte: unixMax,
          },
          limit: LIMIT_PER_ITERATION,
        })
        .then(({ data }) => data);
      customersInTimePeriod = customersInTimePeriod.concat(customers);
      const timestamps = customers.map(({ created }) => created);
      unixMax = Math.min(...timestamps) - 1;
    } while (customers.length == LIMIT_PER_ITERATION);
    return customersInTimePeriod;
  } catch (error) {
    throw new Error(error);
  }
};
