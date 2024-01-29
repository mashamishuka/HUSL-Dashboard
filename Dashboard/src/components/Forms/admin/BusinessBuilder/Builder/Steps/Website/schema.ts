import * as yup from 'yup'

export const websiteGenerateSchema = yup.object({
  domain: yup
    .string()
    .matches(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/, 'Please enter valid domain')
    .required('Please enter a domain name.'),
  email: yup.string().email('Please enter a valid email.'),
  password: yup.string()
})
