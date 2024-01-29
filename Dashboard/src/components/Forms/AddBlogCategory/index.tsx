import Button from '@components/Button'
import { Formik } from 'formik'
import { useState } from 'react'
import { MdAdd } from 'react-icons/md'
import { toast } from 'react-toastify'
import { InputFile, Toggler } from '../components'
import { useRouter } from 'next/router'
import { Input } from '../components/Input'
import { addBlogCategorySchema } from './schema'
import { addBlogCategory } from '@src/restapi/blogs/mutation'

const blogCategoryInitial = {
  name: '',
  is_featured: true,
  is_active: true
}
export const AddBlogCategoryForm: React.FC = () => {
  const { push } = useRouter()
  const [thumb, setThumb] = useState<File | null | undefined>(null)

  const handleAddBlogCategory = async (values: Record<string, any>) => {
    try {
      const formData = new FormData()
      const data: Record<string, any> = {
        ...values
      }
      if (data?.is_active == false) {
        delete data.is_active
      }
      if (data?.is_featured == false) {
        delete data.is_featured
      }

      for (const key in data) {
        formData.append(key, data[key])
      }

      if (thumb) {
        formData.append('thumb', thumb)
      }
      const addedBlog = await addBlogCategory(formData)
      toast.success('Blog category created successfully.')
      push('/blog/categories')
      return addedBlog
    } catch (e: any) {
      toast.error(e?.message)
    }
  }

  return (
    <div>
      <Formik initialValues={blogCategoryInitial} onSubmit={handleAddBlogCategory} validationSchema={addBlogCategorySchema}>
        {({ values, handleChange, handleBlur, handleSubmit, errors, isSubmitting, setFieldValue }) => (
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <Input
              label="Name"
              placeholder="Blog Title"
              name="name"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values?.name}
              error={errors?.name}
              required
            />
            <InputFile
              label="Thumbnail"
              name="thumb"
              hint="Recommended size: 100x100"
              accept="image/*"
              onChange={(evt) => setThumb(evt.currentTarget.files?.[0])}
            />
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-light text-left">Is Featured</label>
              <Toggler defaultChecked onSwitch={(state) => setFieldValue('is_featured', state)} />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-light text-left">Is Active</label>
              <Toggler defaultChecked onSwitch={(state) => setFieldValue('is_active', state)} />
            </div>
            <div className="flex flex-col items-start space-y-3 lg:items-center md:space-x-3 md:flex-row md:space-y-0">
              <Button
                type="submit"
                variant="outline"
                rounded="xl"
                className="flex items-center px-6 py-4 space-x-1 font-light"
                loading={isSubmitting}>
                <MdAdd />
                <span>Add Blog Category</span>
              </Button>
            </div>
          </form>
        )}
      </Formik>
    </div>
  )
}
