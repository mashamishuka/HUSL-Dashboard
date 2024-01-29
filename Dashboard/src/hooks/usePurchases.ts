import useSWR from 'swr'

// prettier-ignore
import {
    CREATE_PURCHASE, CREATE_SUBSCRIPTION, GET_FLATRATES, GET_PURCHASES, GET_SUBSCRIPTIONS, TEST,
    UPDATE_PURCHASE, GET_ACTIVE_SUBSCRIPTIONS, GET_PURCHASES_ALL
} from '@src/restapi/purchases/constants'
import { Purchase } from '@src/restapi/purchases/purchase'
import QueryString from 'qs'
import { GET_WEEKLY_SALES } from '@src/restapi/finances/constants'

export const usePurchases = () => {
  const { data, isLoading } = useSWR<RestApi.Response<Purchase>>(GET_PURCHASES)
  return { data, isLoading }
}

export const usePurchasesByUser = (userId?: string) => {
  const data = useSWR<RestApi.Response<Purchase[]>>(
    userId
      ? GET_PURCHASES_ALL +
          '?' +
          QueryString.stringify({
            user: userId,
            state: 'completed'
          })
      : null
  )
  return data
}

export const useAdd = () => {
  const { data } = useSWR<RestApi.Response<Purchase>>(CREATE_PURCHASE)
  return { data }
}

export const useTest = () => {
  const { data } = useSWR<RestApi.Response<Purchase>>(TEST)
  return { data }
}

export const useAddSubscription = () => {
  const { data } = useSWR<RestApi.Response<Purchase>>(CREATE_SUBSCRIPTION)
  return { data }
}

export const useUpdate = () => {
  const { data } = useSWR<RestApi.Response<Purchase>>(UPDATE_PURCHASE)
  return { data }
}

export const useGetSubscriptions = () => {
  const { data } = useSWR<RestApi.Response<Purchase>>(GET_SUBSCRIPTIONS)
  return { data }
}

export const useGetFlatrates = () => {
  const data = useSWR<RestApi.Response<Purchase>>(GET_FLATRATES)
  return data
}

export const useGetActiveSubscriptions = (stripe_price_id: string) => {
  const { data, isLoading } = useSWR<RestApi.Response<Purchase[]>>(
    GET_ACTIVE_SUBSCRIPTIONS + '?stripe_price_id=' + stripe_price_id
  )
  return { data, isLoading }
}

export const useThisWeekSubscriptions = () => {
  // const params = QueryString.stringify({
  //   stripe_price_id: stripe_price_id,
  //   // nestjs lte gte
  //   created: {
  //     $lte: moment().endOf('week').unix(),
  //     $gte: moment().startOf('week').unix()
  //   }
  // })
  const { data, isLoading } = useSWR<RestApi.Response<number>>(GET_WEEKLY_SALES)
  return { data, isLoading }
}
