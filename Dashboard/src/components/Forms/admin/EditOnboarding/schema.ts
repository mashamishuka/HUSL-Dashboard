import * as yup from 'yup'

export const editOnboardingItemSchema = yup.object({
  title: yup.string().required(),
  content: yup.string()
})
