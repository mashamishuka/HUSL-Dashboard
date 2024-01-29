import api from '@services/api'
import { CREATE_PRODUCT, DELETE_PRODUCT, UPDATE_PRODUCT } from './constants'

export const createProduct = async (data: CreateProductDto): Promise<RestApi.Response<Product>> => {
  return await api
    .post(CREATE_PRODUCT, data)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}

export const updateProduct = async (id: string, data: UpdateProductDto): Promise<RestApi.Response<RestApi.UpdateTypes>> => {
  return await api
    .patch(UPDATE_PRODUCT + id, data)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}

export const deleteProduct = async (id: string): Promise<RestApi.Response<RestApi.UpdateTypes>> => {
  return await api
    .delete(DELETE_PRODUCT + id)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}
