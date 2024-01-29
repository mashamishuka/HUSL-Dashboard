import * as yup from 'yup'

export const initialBusinessCreationSchema = yup.object({
  websiteKey: yup.string(),
  email: yup.string().email('Please enter a valid email.'),
  name: yup.string().required('Please enter a full name.'),
  company: yup.string(),
  nftId: yup.string(),
  password: yup.string().matches(/^.{8,}$/, 'Password should more than 8 characters.')
})
