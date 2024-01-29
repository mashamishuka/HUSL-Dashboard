import * as yup from 'yup'

export const editSocialSchema = yup.object({
  websiteKey: yup.string(),
  username: yup.string().min(4, 'Mininum 4 character.').required('Please enter a username.'),
  password: yup.string().required('Please enter a password.')
})
