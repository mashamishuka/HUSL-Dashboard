import api from '@services/api'
import { CREATE_TEMPLATE } from './constants'

export const createOrUpdateTemplate = async (body: CreateGraphicTemplateDto): Promise<RestApi.Response<GraphicTemplate>> => {
  return await api
    .post(CREATE_TEMPLATE, body)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}

export const deleteTemplate = async (id: string): Promise<RestApi.Response<GraphicTemplate>> => {
  return await api
    .delete(`${CREATE_TEMPLATE}/${id}`)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}
