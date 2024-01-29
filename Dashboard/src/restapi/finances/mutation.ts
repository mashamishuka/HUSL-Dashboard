import api from '@services/api'
import { StripeConfig, StripeConfigDto } from '.'
import { CREATE_STRIPE_CONFIG } from './constants'

export const createStripeConfig = async (body: StripeConfigDto): Promise<RestApi.Response<StripeConfig>> => {
  return await api
    .post(CREATE_STRIPE_CONFIG, body)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}
