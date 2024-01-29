import * as yup from 'yup'

export const brandDetailSchema = yup.object({
  logo: yup.string().required('Please upload a logo.'),
  favicon: yup.string(),
  primaryColor: yup.string().required('Please select a primary color.'),
  secondaryColor: yup.string().required('Please select a secondary color.')
})
