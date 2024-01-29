import * as yup from 'yup'

export const createNicheSchema = yup.object({
  name: yup.string().required('Name is required')
})
