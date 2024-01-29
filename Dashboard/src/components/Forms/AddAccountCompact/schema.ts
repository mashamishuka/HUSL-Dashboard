import * as yup from 'yup'

export const addAccountSchema = yup.object({
  websiteKey: yup
    .string()
    .matches(
      /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/,
      'Please enter a valid URL.'
    )
    .required('Please enter a website URL.'),
  username: yup.string().min(4, 'Mininum 4 character.').required('Please enter a username.'),
  password: yup
    .string()
    .required('Please enter a password.')
    .matches(/^.{8,}$/, 'Password should more than 8 characters.')
})
