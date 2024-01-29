import api from '@services/api'

// prettier-ignore
import {
    ADD_TX_HASH_TO_PURCHASE, CREATE_DIRECT_PURCHASE, CREATE_PURCHASE, CREATE_SUBSCRIPTION, TEST, UPDATE_PURCHASE
} from './constants'

function current_unix_timestamp() {
  return Math.floor(Date.now() / 1000)
}

export const createPurchase = async (
  name: string,
  price: number,
  is_stripe_not_usdh: boolean,
  optional_data: { quantity?: number; repetition?: string }
): Promise<RestApi.Response<any>> => {
  const purchase: Record<string, any> = {
    name: name,
    price: price,
    created: current_unix_timestamp(),
    state: 'pending',
    is_stripe_not_usdh: is_stripe_not_usdh,
    data: optional_data
  }
  return await api
    .post(CREATE_PURCHASE, purchase)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}

export const createDirectPurchase = async (
  user: string,
  name: string,
  note: string,
  optional_data: { quantity?: number; repetition?: string }
): Promise<RestApi.Response<any>> => {
  const purchase: Record<string, any> = {
    user,
    name,
    note,
    created: current_unix_timestamp(),
    data: optional_data
  }
  return await api
    .post(CREATE_DIRECT_PURCHASE, purchase)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}

export const deleteDirectPurchase = async (purchase_id: string): Promise<RestApi.Response<any>> => {
  return await api
    .delete(CREATE_DIRECT_PURCHASE + '/' + purchase_id)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}

export const createSubscription = async (
  name: string,
  price: number,
  is_stripe_not_usdh: boolean,
  optional_data: { quantity?: number; repetition?: string; stripe_price?: string }
): Promise<RestApi.Response<any>> => {
  const purchase: Record<string, any> = {
    name: name,
    price: price,
    created: current_unix_timestamp(),
    state: 'pending',
    is_stripe_not_usdh: is_stripe_not_usdh,
    data: optional_data
  }
  return await api
    .post(CREATE_SUBSCRIPTION, purchase)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}

export const updatePurchase = async (purchase_id: string): Promise<RestApi.Response<any>> => {
  const data: Record<string, any> = {
    purchase_id: purchase_id
  }
  return await api
    .post(UPDATE_PURCHASE, data)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}

export const test = async (args: Record<string, any> = {}): Promise<RestApi.Response<any>> => {
  const data: Record<string, any> = args
  return await api
    .post(TEST, data)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}

export const addTransactionHashToPurchase = async (
  purchase_id: string,
  transaction_hash: string
): Promise<RestApi.Response<any>> => {
  const data: Record<string, any> = {
    purchase_id: purchase_id,
    transaction_hash: transaction_hash
  }
  return await api
    .post(ADD_TX_HASH_TO_PURCHASE, data)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}
