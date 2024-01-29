import api from '@services/api'
import { CREATE_EMAIL_CONFIG } from './constants'
import { EmailConfig, EmailConfigDto } from './emails'

export const createEmailConfig = async (body: EmailConfigDto): Promise<RestApi.Response<EmailConfig>> => {
  return await api
    .post(CREATE_EMAIL_CONFIG, body)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}
