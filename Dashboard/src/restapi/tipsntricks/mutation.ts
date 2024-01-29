import api from '@services/api'
import { CREATE_USER_TIPS_N_TRICK } from './constants'
import { TipsNTrick, TipsNTrickDto } from './tipsntricks'

export const createUserTipsNTrick = async (body: TipsNTrickDto, userId?: string): Promise<RestApi.Response<TipsNTrick>> => {
  const data: Record<string, any> = {
    tipsNtricks: body
  }
  if (userId) {
    data.user = userId
  }
  return await api
    .post(CREATE_USER_TIPS_N_TRICK, data)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}
