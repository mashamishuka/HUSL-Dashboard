import * as yup from 'yup'

export const notifyUserSchema = yup.object({
  title: yup.string().required('Please enter notification title.'),
  content: yup.string().required('Please enter notification content.'),
  user_ids: yup.array().min(1),
  is_scheduled: yup.boolean()
})
