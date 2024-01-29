import api from '@services/api'
import { DELETE_USER, GET_USER_BY_NFTS, RESTORE_USER, UPDATE_USERS } from './constants'
import { User, UserDto } from './user'

export const editUser = async (id: string, body?: UserDto): Promise<RestApi.Response<User>> => {
  if (!body?.profilePicture) {
    delete body?.profilePicture
  }
  return await api
    .patch(UPDATE_USERS + id, body)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err?.response?.data?.message)
    })
}

export const deleteUser = async (id: string): Promise<RestApi.Response<User>> => {
  return await api
    .delete(DELETE_USER + id)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err?.response?.data?.message)
    })
}

export const restoreUser = async (id: string): Promise<RestApi.Response<User>> => {
  return await api
    .patch(RESTORE_USER + id)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err?.response?.data?.message)
    })
}

export const getUserByNfts = async (
  nftIds: string | string[]
): Promise<RestApi.Response<Pick<User, '_id' | 'name' | 'nftId'>[]>> => {
  let ids = ''
  if (Array.isArray(nftIds)) {
    ids = nftIds.join(',')
  } else {
    ids = nftIds
  }
  return await api
    .get(GET_USER_BY_NFTS + ids)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err?.response?.data?.message)
    })
}
