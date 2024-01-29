import * as yup from 'yup'

export const editNicheSchema = yup.object({
  name: yup.string().required('Name is required')
})
