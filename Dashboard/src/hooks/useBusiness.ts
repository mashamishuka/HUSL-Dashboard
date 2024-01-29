import { Business } from '@src/restapi/businesses/business'
import QueryString from 'qs'
import useSWR from 'swr'
import { GET_BUSINESS } from '../restapi/businesses/constants'

export const useBusiness = (id?: string) => {
  const business = useSWR<RestApi.Response<Business>>(id ? GET_BUSINESS + id : null)

  return business
}

export const useBusinesses = (params?: Record<string, any>) => {
  const query = QueryString.stringify(params, { skipNulls: true })
  const businesses = useSWR<RestApi.Response<Business[]>>(GET_BUSINESS + '?' + query)

  return businesses
}
