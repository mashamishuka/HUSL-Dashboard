import api from '@services/api'
import { AccountDto, SocialAccount, SocialAccountDto } from './account'
import {
  CREATE_SOCIAL_ACCOUNT,
  DELETE_USER_ACCOUNT,
  EDIT_USER_ACCOUNT,
  EDIT_USER_SOCIAL_ACCOUNT,
  DELETE_USER_SOCIAL_ACCOUNT
} from './constants'

export const createSocialAccount = async (body: SocialAccountDto): Promise<RestApi.Response<SocialAccount>> => {
  return await api
    .post(CREATE_SOCIAL_ACCOUNT, body)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}

export const deleteSocialAccount = async (id: string): Promise<RestApi.Response<SocialAccount>> => {
  return await api
    .delete(DELETE_USER_SOCIAL_ACCOUNT + id)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}

export const editSocialAccount = async (id: string, body: SocialAccountDto): Promise<RestApi.Response<SocialAccount>> => {
  return await api
    .patch(EDIT_USER_SOCIAL_ACCOUNT + id, body)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}

export const deleteAccount = async (id: string): Promise<RestApi.Response<SocialAccount>> => {
  return await api
    .delete(DELETE_USER_ACCOUNT + id)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}

export const editAccount = async (id: string, body: AccountDto): Promise<RestApi.Response<SocialAccount>> => {
  return await api
    .patch(EDIT_USER_ACCOUNT + id, body)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}
