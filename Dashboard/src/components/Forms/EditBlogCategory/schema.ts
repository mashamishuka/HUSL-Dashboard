import * as yup from 'yup'

export const editBlogCategorySchema = yup.object({
  name: yup.string().required('Please enter category name.')
})
