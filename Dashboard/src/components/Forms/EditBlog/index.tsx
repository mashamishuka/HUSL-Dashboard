import Button from '@components/Button'
import { useMe } from '@hooks/useMe'
import { Formik } from 'formik'
import { useMemo, useState } from 'react'
import { MdEdit } from 'react-icons/md'
import { toast } from 'react-toastify'
import useSWR from 'swr'
import { InputFile, SingleSelect, TextArea, Toggler } from '../components'
import { useRouter } from 'next/router'
import { Input } from '../components/Input'
import { TextEditorProps } from '@components/Forms/components/TextEditor'
import dynamic from 'next/dynamic'
import { SINGLE_BLOG_POST, WEBSITE_BLOG_CATEGORIES } from '@src/restapi/blogs/constants'
import { editBlogPost } from '@src/restapi/blogs/mutation'
import { editBlogSchema } from './schema'
import { huslWebStorageUrl } from '@utils/index'
import Image from 'next/image'
const TextEditor = dynamic<TextEditorProps>(
  () => import('@components/Forms/components/TextEditor').then((mod) => mod.TextEditor),
  {
    ssr: false
  }
)

export const EditBlogForm: React.FC = () => {
  const { push, query } = useRouter()
  const { data: me } = useMe()
  const { data: categories } = useSWR<BlogCategory[]>(WEBSITE_BLOG_CATEGORIES)
  const { data } = useSWR<Blog>(SINGLE_BLOG_POST(query?.id?.toString()))

  const [thumb, setThumb] = useState<File | null | undefined>(null)

  const initialData = useMemo(() => {
    return {
      title: data?.title || '',
      content_short: data?.content_short || '',
      content: data?.content || '',
      thumb: data?.thumb || '',
      category_id: data?.category_id || '',
      time_read: data?.time_read || '0',
      is_featured: data?.is_featured,
      is_active: data?.is_active,
      is_published: data?.is_published,
      title_seo: data?.title_seo || '',
      description_seo: data?.description_seo || '',
      keyword_seo: data?.keyword_seo || ''
    }
  }, [data])

  const handleEditBlog = async (values: Record<string, any>) => {
    if (!data?.id) {
      toast.error('Your data is still loading...')
      return
    }
    try {
      const formData = new FormData()
      const body: Record<string, any> = {
        ...values,
        landingpage_id: me?.data?.websiteKey
      }
      if (body?.is_active == false) {
        delete body.is_active
      }
      if (body?.is_published == false) {
        delete body.is_published
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
      const editedBlog = await editBlogPost(data?.id?.toString(), formData)
      toast.success('Blog post edited successfully.')
      push('/blog')
      return editedBlog
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
      <Formik initialValues={initialData} onSubmit={handleEditBlog} validationSchema={editBlogSchema} enableReinitialize>
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
                value={values?.category_id?.toString()}
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
            <TextEditor
              label="Content"
              name="content"
              setFieldValue={setFieldValue}
              value={values?.content}
              uploader="webhusl"
            />
            <div>
              {!thumb && values?.thumb !== '' && (
                <Image
                  src={huslWebStorageUrl('/blogs/thumbnails/' + values?.thumb)}
                  width={150}
                  height={150}
                  className="object-contain"
                />
              )}
              <InputFile
                label="Thumbnail"
                name="thumb"
                hint="Recommended size: 100x100"
                accept="image/*"
                onChange={(evt) => setThumb(evt.currentTarget.files?.[0])}
              />
            </div>
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
              <Toggler defaultChecked={values.is_featured} onSwitch={(state) => setFieldValue('is_featured', state)} />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-light text-left">Is Active</label>
              <Toggler defaultChecked={values.is_active} onSwitch={(state) => setFieldValue('is_active', state)} />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-light text-left">Is Published</label>
              <Toggler defaultChecked={values.is_published} onSwitch={(state) => setFieldValue('is_published', state)} />
            </div>
            <div className="flex flex-col items-start space-y-3 lg:items-center md:space-x-3 md:flex-row md:space-y-0">
              <Button
                type="submit"
                variant="outline"
                rounded="xl"
                className="flex items-center px-6 py-4 space-x-1 font-light"
                loading={isSubmitting}>
                <MdEdit />
                <span>Edit Blog Post</span>
              </Button>
            </div>
          </form>
        )}
      </Formik>
    </div>
  )
}
