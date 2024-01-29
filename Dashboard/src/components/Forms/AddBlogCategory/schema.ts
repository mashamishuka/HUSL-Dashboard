import * as yup from 'yup'

export const addBlogCategorySchema = yup.object({
  name: yup.string().required('Please enter category name.')
})
