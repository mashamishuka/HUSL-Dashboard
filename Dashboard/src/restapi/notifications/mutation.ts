import api from '@services/api'
import { ADD_NOTIFICATION, GET_NOTIFICATIONS, DELETE_NOTIFICATIONS } from './constants'

export const addNotification = async (body: Record<string, any>): Promise<Blog> => {
  return await api
    .post(ADD_NOTIFICATION, body)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err?.response?.data?.message)
    })
}
export const getAllNotification = async () => {
  return await api
    .get(GET_NOTIFICATIONS)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err?.response?.data?.message)
    })
}
export const deleteNotifications = async (id: string) => {
  return await api
    .delete(`${DELETE_NOTIFICATIONS}/${id}`)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err?.response?.data?.message)
    })
}
