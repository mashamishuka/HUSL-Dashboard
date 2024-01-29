import * as yup from 'yup'

export const addUserSchema = yup.object({
  websiteKey: yup
    .string()
    .matches(
      /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/,
      'Please enter a valid URL.'
    ),
  name: yup.string().required('Please enter a fullname.'),
  company: yup.string(),
  email: yup.string().email('Please enter correct email.'),
  nftId: yup.string().required('Please enter an NFT ID.')
})
