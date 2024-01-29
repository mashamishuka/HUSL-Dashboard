import { GET_ME } from '@src/restapi/users/constants'
import { User } from '@src/restapi/users/user'
import useSWR from 'swr'

export const useMe = () => {
  const { data } = useSWR<RestApi.Response<User>>(GET_ME)

  return { data, me: data?.data }
}
