import { FIND_ONE_USERS } from '@src/restapi/users/constants'
import { User } from 'next-auth'
import QueryString from 'qs'
import useSWR from 'swr'

export const useUser = (userId?: string) => {
  const { data } = useSWR<RestApi.Response<User['user']>>(userId ? FIND_ONE_USERS + userId : null)

  return { data }
}

export const useUsers = (params?: Record<string, any>) => {
  const query = QueryString.stringify(params, { skipNulls: true })
  const { data } = useSWR<RestApi.Response<User['user'][]>>(FIND_ONE_USERS + '?' + query)

  return { data }
}
