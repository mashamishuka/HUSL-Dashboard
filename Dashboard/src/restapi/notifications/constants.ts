// const API_URL = process.env.WEBHUSL_API_URL || 'http://localhost:8000/api/v1'
const API_URL = 'http://localhost:1337'
const API_TOKEN = process.env.WEBHUSL_API_MASTER_KEY

export const WEBSITE_NOTIFICATION_LIST = `${API_URL}/notifications?token=${API_TOKEN}`
export const ADD_NOTIFICATION = `${API_URL}/notifications/add`
export const GET_NOTIFICATIONS = `${API_URL}/notifications`
export const DELETE_NOTIFICATIONS = `${API_URL}/notifications/delete`
