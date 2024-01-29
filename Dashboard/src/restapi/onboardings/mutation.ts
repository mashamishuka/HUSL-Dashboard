import api from '@services/api'
import { UPDATE_ONBOARDING_ITEM_ORDER } from './constants'

export const createOnboardingItem = async (data?: Record<string, any>): Promise<RestApi.Response<Onboarding>> => {
  try {
    return await api.post('/onboardings', data).then(({ data }) => data)
  } catch (error: any) {
    throw new Error(error)
  }
}

export const editOnboardingItem = async (id: string, data?: Record<string, any>): Promise<RestApi.Response<Onboarding>> => {
  try {
    return await api.patch('/onboardings/' + id, data).then(({ data }) => data)
  } catch (error: any) {
    throw new Error(error)
  }
}

export const updateOrder = async (order: string[]) => {
  try {
    return await api.patch(UPDATE_ONBOARDING_ITEM_ORDER, { order }).then(({ data }) => data)
  } catch (error: any) {
    throw new Error(error)
  }
}

export const deleteOnboardingItem = async (id: string) => {
  try {
    return await api.delete(`/onboardings/${id}`).then(({ data }) => data)
  } catch (error: any) {
    throw new Error(error)
  }
}

export const saveOnboardingProgress = async (body?: Record<string, any>) => {
  try {
    return await api.post('/onboarding-progresses', body).then(({ data }) => data)
  } catch (error: any) {
    throw new Error(error)
  }
}
