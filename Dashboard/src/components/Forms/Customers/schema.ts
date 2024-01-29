import * as yup from 'yup'

export const customerSchema = yup.object({
  fullname: yup.string().required('Please enter a fullname.'),
  email: yup.string().email('Please enter a valid email.').required('Please enter an email.'),
  profilePicture: yup.string(),
  phone: yup
    .string()
    .required('Please enter a phone number.')
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Please enter a valid phone number.'),
  gender: yup.mixed().oneOf(['male', 'female']).required('Please choose a gender.')
})
