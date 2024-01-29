import * as yup from 'yup'

export const adminLoginSchema = yup.object({
  identifier: yup.string().required('Please enter an email or NFT ID.'),
  password: yup
    .string()
    .required('Please enter a password.')
    .matches(/^.{8,}$/, 'Password should more than 8 characters.')
})
