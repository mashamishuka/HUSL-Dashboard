import * as moment from 'moment';
import Stripe from 'stripe';

const CUSTOMER_PLAN_API_ID = 'price_1LzkozCOIb8tHxq5VG6Aqn8J';

/**
 * Calculate balance transaction payout
 * @param data
 * @returns number
 */
export const calculateBalanceTrxPayout = (
  data: Stripe.BalanceTransaction[],
) => {
  return data?.reduce((accumulator, c) => {
    if (c?.type === 'payout' || c?.type === 'stripe_fee') {
      return accumulator + c?.amount;
    }
    return accumulator;
  }, 0);
};

/**
 * Calculate balance transaction fees
 */
export const calculateBalanceTrxFees = (data: Stripe.BalanceTransaction[]) => {
  return data?.reduce((accumulator, c) => {
    if (c?.type === 'stripe_fee') {
      return accumulator + c?.amount;
    }
    return accumulator;
  }, 0);
};

/**
 * Sum total balance transaction
 */
export const sumTotalBalanceTrx = (data: Stripe.BalanceTransaction[]) => {
  return data?.reduce((accumulator, c) => {
    return accumulator + c?.amount;
  }, 0);
};

/**
 * Sum total invoice transaction
 */
export const sumTotalInvoiceTrx = (data: Stripe.Invoice[]) => {
  return data?.reduce((accumulator, c) => {
    return accumulator + c?.total;
  }, 0);
};

/**
 * Sum total churned revenue
 */
export const sumTotalChurnedRevenue = (data: Stripe.SubscriptionItem[]) => {
  return data?.reduce((accumulator, c) => {
    return accumulator + c?.plan?.amount;
  }, 0);
};

/**
 * Filter invoice by metadata
 */
export const filterInvoiceByMetadata = (
  data: Stripe.Invoice[],
  tag?: string,
) => {
  const invoices = data?.filter(
    (invoice) =>
      invoice?.lines?.data?.filter(
        (line) => line?.metadata?.builderName === tag,
      )?.length > 0,
  );
  return invoices;
};

/**
 * Filter invoice by metadata
 */
export const filterCustomerByInvoice = (
  data: Stripe.Invoice[],
  tag?: string,
) => {
  const invoices = data?.filter(
    (invoice) =>
      invoice?.lines?.data?.filter(
        (line) =>
          line?.metadata?.builderName === tag &&
          line?.plan?.id === CUSTOMER_PLAN_API_ID,
      )?.length > 0,
  );
  return invoices;
};

/**
 * Filter fee invoice by metadata
 */
export const filterFeeInvoiceByMetadata = (
  data: Stripe.Invoice[],
  tag?: string,
) => {
  const invoices = data?.filter(
    (invoice) =>
      invoice?.lines?.data?.filter(
        (line) =>
          line?.metadata?.builderName === tag &&
          line?.description?.includes('Instant App Builder'),
      )?.length > 0,
  );
  return invoices;
};

/**
 * Map and extract customer information from invoice
 */
export const mapAndExtractCustomer = (data: Stripe.Invoice[]) => {
  let customers = data?.map((v) => ({
    customerId: v.customer,
    name: v?.customer_name,
    email: v?.customer_email,
    phone: v?.customer_phone,
    shipping: v?.customer_shipping,
    tax: v?.customer_tax_exempt,
    taxIds: v?.customer_tax_ids,
    address: v?.customer_address,
    created: v.created,
  }));
  customers = [
    ...new Map(customers?.map((item) => [item['customerId'], item])).values(),
  ];
  return customers;
};

/**
 * Filter subscription by metadata / tag
 */
export const filterSubscriptionByMetadata = (
  data: Stripe.Subscription[],
  tag?: string,
) => {
  const items = data?.filter(
    (item) => item?.metadata?.builderName === tag,
    // (item as any).plan?.id === CUSTOMER_PLAN_API_ID,
  );
  return items;
};

/**
 * Filter customer by metadata / tag
 */
export const filterCustomerByMetadata = (
  data: Stripe.Customer[],
  tag?: string,
) => {
  const items = data?.filter(
    (item) =>
      item?.metadata?.builderName === tag && item?.object === 'customer',
  );
  return items;
};

/**
 * Filter invoice by product
 */
export const filterInvoiceByProduct = (data: Stripe.Invoice[]) => {
  const invoices = data?.filter(
    (invoice) =>
      invoice?.lines?.data?.filter(
        (line) => line?.plan?.product == 'prod_MjDFlwAC9JSF0H',
      )?.length > 0,
  );
  return invoices;
};

/**
 * Filter subscription by product
 */
export const filterSubscriptionByProduct = (data: Stripe.Subscription[]) => {
  const invoices = data?.filter(
    (invoice) =>
      invoice?.items?.data?.filter(
        (line) => line?.plan?.product == 'prod_MjDFlwAC9JSF0H',
      )?.length > 0,
  );
  return invoices;
};

/**
 * Format invoices, extract customer information
 */
export function formatInvoices(invoices: Stripe.Invoice[]) {
  return invoices.map(({ lines, created, amount_paid }) => ({
    builderName: lines?.data[0]?.metadata.builderName,
    created: created,
    created_formatted: moment.unix(created).format('DD/MM/YYYY'),
    amount_paid: amount_paid,
  }));
}

/**
 * Sum formatted invoices, return amount paid
 */
type SumFormattedInvoices = (
  formattedInvoices?: {
    amount_paid: number;
  }[],
) => number;

export const sumFormattedInvoices: SumFormattedInvoices = (
  formattedInvoices,
) => {
  return (formattedInvoices || [])
    .map(({ amount_paid }: { amount_paid: number }) => amount_paid)
    .reduce((sum, to_add) => sum + to_add, 0);
};
