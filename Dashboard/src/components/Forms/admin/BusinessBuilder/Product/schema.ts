import * as yup from 'yup'

export const addProductSchema = yup.object({
  websiteKey: yup.string(),
  name: yup.string().required('Please enter a full name.')
})
