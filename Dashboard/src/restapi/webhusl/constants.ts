const API_BASE_URL = process.env.WEBHUSL_API_URL || 'http://localhost:8000/api/v1'

export const WEBHUSL_API_MASTER_KEY = process.env.WEBHUSL_API_MASTER_KEY
export const GET_WEBSITES = API_BASE_URL + '/website-list/compact?token='
