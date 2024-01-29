import api from '@services/api'
import { CREATE_CUSTOMER, DELETE_CUSTOMER, UPDATE_CUSTOMER } from './constants'
import { Customer, CustomerDto } from './customers'

export const createCustomer = async (body: CustomerDto): Promise<RestApi.Response<Customer>> => {
  return await api
    .post(CREATE_CUSTOMER, body)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}

export const updateCustomer = async (customerId: string, body: CustomerDto): Promise<RestApi.Response<Customer>> => {
  return await api
    .patch(UPDATE_CUSTOMER(customerId), body)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}

export const deleteCustomer = async (customerId: string): Promise<RestApi.Response<Customer>> => {
  return await api
    .delete(DELETE_CUSTOMER(customerId))
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}
