import * as yup from 'yup'

export const createOnboardingItemSchema = yup.object({
  title: yup.string().required(),
  content: yup.string()
})
