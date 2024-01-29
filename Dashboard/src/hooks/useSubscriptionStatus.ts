import { GET_SUBSCRIPTION_STATUS } from '@src/restapi/purchases/constants'
import useSWR from 'swr'

export const useSubscriptionStatus = (purchase_id: string) => {
  return useSWR<RestApi.Response<{ subscription_status: string }>>(GET_SUBSCRIPTION_STATUS + '?purchase_id=' + purchase_id)
}
