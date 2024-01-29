import * as yup from 'yup'

export const stripeConfigSchema = yup.object({
  whitelabelTag: yup.string(),
  publishableKey: yup.string().required('Please enter stripe publishable key.'),
  secretKey: yup.string().required('Please enter stripe secret key.')
})
