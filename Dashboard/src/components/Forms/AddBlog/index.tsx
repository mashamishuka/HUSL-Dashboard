import Button from '@components/Button'
import { useMe } from '@hooks/useMe'
import { Formik } from 'formik'
import { useMemo, useState } from 'react'
import { MdAdd } from 'react-icons/md'
import { toast } from 'react-toastify'
import useSWR from 'swr'
import { InputFile, SingleSelect, TextArea, Toggler } from '../components'
import { useRouter } from 'next/router'
import { Input } from '../components/Input'
import { addBlogSchema } from './schema'
import { TextEditorProps } from '@components/Forms/components/TextEditor'
import dynamic from 'next/dynamic'
import { WEBSITE_BLOG_CATEGORIES } from '@src/restapi/blogs/constants'
import { addBlogPost } from '@src/restapi/blogs/mutation'

const TextEditor = dynamic<TextEditorProps>(
  () => import('@components/Forms/components/TextEditor').then((mod) => mod.TextEditor),
  {
    ssr: false
  }
)

const blogInitial = {
  title: '',
  content_short: '',
  content: '',
  thumb: '',
  category_id: '',
  time_read: '0',
  is_featured: true,
  is_active: true,
  is_published: false,
  landingpage_id: '',
  title_seo: '',
  description_seo: '',
  keyword_seo: ''
}
export const AddBlogForm: React.FC = () => {
  const { push } = useRouter()
  const { data: me } = useMe()
  const { data: categories } = useSWR<BlogCategory[]>(WEBSITE_BLOG_CATEGORIES)
  const [thumb, setThumb] = useState<File | null | undefined>(null)

  const handleAddBlog = async (values: Record<string, any>) => {
    try {
      const formData = new FormData()
      const data: Record<string, any> = {
        ...values,
        landingpage_id: me?.data?.websiteKey
      }
      if (data?.is_active == false) {
        delete data.is_active
      }
      if (data?.is_published == false) {
        delete data.is_published
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
      const addedBlog = await addBlogPost(formData)
      toast.success('Blog post created successfully.')
      push('/blog')
      return addedBlog
    } catch (e: any) {
      toast.error(e?.message)
    }
  }

  const categoriesOptions = useMemo(() => {
    if (categories && categories?.length > 0) {
      return categories?.map((item) => ({
        label: item.name,
        value: item.id?.toString()
      }))
    } else {
      return []
    }
  }, [categories])

  return (
    <div>
      <Formik initialValues={blogInitial} onSubmit={handleAddBlog} validationSchema={addBlogSchema}>
        {({ values, handleChange, handleBlur, handleSubmit, errors, isSubmitting, setFieldValue }) => (
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <Input
              label="Title"
              placeholder="Blog Title"
              name="title"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values?.title}
              error={errors?.title}
              required
            />
            {categories && categories?.length > 0 && (
              <SingleSelect
                label="Category"
                name="category_id"
                value={values?.category_id}
                error={errors?.category_id}
                items={[
                  {
                    label: 'Select Category',
                    value: ''
                  },
                  ...categoriesOptions
                ]}
                setFieldValue={setFieldValue}
                required
              />
            )}
            <TextArea
              label="Excerpt"
              placeholder="Content short"
              name="content_short"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values?.content_short}
              error={errors?.content_short}
              required
            />
            <TextEditor label="Content" name="content" setFieldValue={setFieldValue} uploader="webhusl" />
            <InputFile
              label="Thumbnail"
              name="thumb"
              hint="Recommended size: 100x100"
              accept="image/*"
              onChange={(evt) => setThumb(evt.currentTarget.files?.[0])}
              error={errors?.thumb}
            />
            <TextArea
              label="Meta Title"
              placeholder="Meta title for SEO"
              name="title_seo"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values?.title_seo}
              error={errors?.title_seo}
              required
            />
            <TextArea
              label="Meta Description"
              placeholder="Meta description for SEO"
              name="description_seo"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values?.description_seo}
              error={errors?.description_seo}
              required
            />
            <TextArea
              label="Meta Keyword"
              placeholder="Meta keyword for SEO"
              name="keyword_seo"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values?.keyword_seo}
              error={errors?.keyword_seo}
              required
            />
            <Input
              type="number"
              label="Read Times"
              name="time_read"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values?.time_read}
              error={errors?.time_read}
              required
            />
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-light text-left">Is Featured</label>
              <Toggler defaultChecked onSwitch={(state) => setFieldValue('is_featured', state)} />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-light text-left">Is Active</label>
              <Toggler defaultChecked onSwitch={(state) => setFieldValue('is_active', state)} />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-light text-left">Is Published</label>
              <Toggler onSwitch={(state) => setFieldValue('is_published', state)} />
            </div>
            <div className="flex flex-col items-start space-y-3 lg:items-center md:space-x-3 md:flex-row md:space-y-0">
              <Button
                type="submit"
                variant="outline"
                rounded="xl"
                className="flex items-center px-6 py-4 space-x-1 font-light"
                loading={isSubmitting}>
                <MdAdd />
                <span>Add Blog Post</span>
              </Button>
            </div>
          </form>
        )}
      </Formik>
    </div>
  )
}
