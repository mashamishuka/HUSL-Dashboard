import Button from '@components/Button'
import { Formik } from 'formik'
import { useMemo, useState } from 'react'
import { MdEdit } from 'react-icons/md'
import { toast } from 'react-toastify'
import useSWR from 'swr'
import { InputFile, Toggler } from '../components'
import { useRouter } from 'next/router'
import { Input } from '../components/Input'
import { SINGLE_BLOG_CATEGORY } from '@src/restapi/blogs/constants'
import { editBlogCategory } from '@src/restapi/blogs/mutation'
import { editBlogCategorySchema } from './schema'

export const EditBlogCategoryForm: React.FC = () => {
  const { push, query } = useRouter()
  const { data } = useSWR<BlogCategory>(SINGLE_BLOG_CATEGORY(query?.id?.toString()))

  const [thumb, setThumb] = useState<File | null | undefined>(null)

  const initialData = useMemo(() => {
    return {
      name: data?.name || '',
      is_featured: data?.is_featured,
      is_active: data?.is_active
    }
  }, [data])

  const handleEditBlogCategory = async (values: Record<string, any>) => {
    if (!data?.id) {
      toast.error('Your data is still loading...')
      return
    }
    try {
      const formData = new FormData()
      const body: Record<string, any> = {
        ...values
      }
      if (body?.is_active == false) {
        delete body.is_active
      }
      if (body?.is_featured == false) {
        delete body.is_featured
      }
      for (const key in body) {
        formData.append(key, body[key])
      }

      if (thumb) {
        formData.append('thumb', thumb)
      }
      formData.append('_method', 'PATCH')
      const editedBlog = await editBlogCategory(data?.id?.toString(), formData)
      toast.success('Blog category edited successfully.')
      push('/blog/categories')
      return editedBlog
    } catch (e: any) {
      toast.error(e?.message)
    }
  }

  return (
    <div>
      <Formik
        initialValues={initialData}
        onSubmit={handleEditBlogCategory}
        validationSchema={editBlogCategorySchema}
        enableReinitialize>
        {({ values, handleChange, handleBlur, handleSubmit, errors, isSubmitting, setFieldValue }) => (
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <Input
              label="Name"
              placeholder="Category Name"
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
              <Toggler defaultChecked={values.is_featured} onSwitch={(state) => setFieldValue('is_featured', state)} />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-light text-left">Is Active</label>
              <Toggler defaultChecked={values.is_active} onSwitch={(state) => setFieldValue('is_active', state)} />
            </div>
            <div className="flex flex-col items-start space-y-3 lg:items-center md:space-x-3 md:flex-row md:space-y-0">
              <Button
                type="submit"
                variant="outline"
                rounded="xl"
                className="flex items-center px-6 py-4 space-x-1 font-light"
                loading={isSubmitting}>
                <MdEdit />
                <span>Edit Blog Category</span>
              </Button>
            </div>
          </form>
        )}
      </Formik>
    </div>
  )
}
