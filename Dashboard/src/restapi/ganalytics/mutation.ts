import api from '@services/api'
import { CREATE_GA_CONFIG } from './constants'

export const createGAConfig = async (body: GAnalyticConfigDto): Promise<RestApi.Response<GAnalyticConfig>> => {
  return await api
    .post(CREATE_GA_CONFIG, body)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}
