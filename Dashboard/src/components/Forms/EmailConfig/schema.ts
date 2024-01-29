import * as yup from 'yup'

export const emailConfigSchema = yup.object({
  token: yup.string().required('Please enter the HUSL Mail API Token.')
})
