// api.js
import { AxiosInstance } from 'axios';

const Axios = require('axios');

const api: AxiosInstance = Axios.create({
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export const webHuslApi = Axios.create({
  baseURL: process.env.WEBHUSL_API_URL || 'https://web.husl.app/api/v1',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  params: {
    token:
      process.env.WEBHUSL_API_MASTER_KEY ||
      'JNJzTHgMjqCj578LqVg48zMSGg1H3YXUfQN9a2q78wHI4uK3nCGPWwhpECFz',
  },
});
export default api;
