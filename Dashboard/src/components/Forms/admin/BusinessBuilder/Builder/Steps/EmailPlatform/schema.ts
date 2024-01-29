import * as yup from 'yup'

export const emailPlatformSchema = yup.object({
  huslMailApiKey: yup.string()
})
