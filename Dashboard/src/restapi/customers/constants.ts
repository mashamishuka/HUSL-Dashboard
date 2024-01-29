export const GET_ALL_CUSTOMERS = '/customers'
export const CREATE_CUSTOMER = '/customers'
export const UPDATE_CUSTOMER = (id: string) => `/customers/${id}`
export const GET_CUSTOMER_BY_ID = (id: string) => `/customers/${id}`
export const DELETE_CUSTOMER = (id: string) => `/customers/${id}`
export const FORCE_DELETE_CUSTOMER = (id: string) => `/customers/${id}/force`
