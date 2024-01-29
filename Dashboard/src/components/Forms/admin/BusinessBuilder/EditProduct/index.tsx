import { Formik } from 'formik'
import { useMemo } from 'react'
import { FiExternalLink } from 'react-icons/fi'
import { MdSave } from 'react-icons/md'
import { toast } from 'react-toastify'

import Button from '@components/Button'
import { SingleSelect, TextArea } from '@components/Forms/components'
import { Input } from '@components/Forms/components/Input'
import { useWebsites } from '@hooks/useWebsites'
import { huslWebName, huslWebPublicUrl } from '@utils/index'

import { addProductSchema } from './schema'
import { updateProduct } from '@src/restapi/products/mutation'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { GET_PRODUCTS } from '@src/restapi/products/constants'

export const EditProductForm: React.FC = () => {
  const router = useRouter()
  const productId = router?.query?.id?.toString()

  const { data } = useSWR<RestApi.Response<Product>>(productId ? GET_PRODUCTS + productId : null)
  const { data: websites, loading } = useWebsites()

  const websiteList = useMemo(() => {
    if (websites && websites?.length > 0) {
      return websites?.map((item) => ({
        label: item?.custom_domain || item?.sub_domain,
        value: item.code
      }))
    } else {
      return []
    }
  }, [websites])

  const initialValues = useMemo(() => {
    return {
      websiteKey: data?.data?.websiteKey || '',
      name: data?.data?.name || '',
      shortAdCopy: data?.data?.shortAdCopy || '',
      longAdCopy: data?.data?.longAdCopy || ''
    }
  }, [data?.data])

  const handleEditProduct = async (values: UpdateProductDto) => {
    if (!productId) {
      toast.warning('Data loading, please wait...')
      return
    }
    try {
      await updateProduct(productId, values).then((res) => {
        if (res?.data?.modifiedCount) {
          toast.success('Product edited successfully.')
          router?.push('/admin/builder/product')
        } else {
          toast.warning('Server error, no changes made. Please try again later.')
        }
      })
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Something went wrong. Please try again later.')
    }
  }
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleEditProduct}
      validationSchema={addProductSchema}
      enableReinitialize>
      {({ values, handleChange, handleBlur, handleSubmit, errors, isSubmitting, setFieldValue }) => (
        <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
          <Input
            label="Product Name"
            placeholder="HUSL"
            name="name"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values?.name}
            error={errors?.name}
            required
          />
          <Input
            label="Short Ad Copy"
            placeholder="Short Ad Copy, you can use brackets. E.g [company]"
            name="shortAdCopy"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values?.shortAdCopy}
            error={errors?.shortAdCopy}
            required
          />
          <TextArea
            label="Long Ad Copy"
            placeholder="Long Ad Copy, you can use brackets. E.g [company]"
            name="longAdCopy"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values?.longAdCopy}
            error={errors?.longAdCopy}
            required
          />

          <div>
            {!loading && (
              <SingleSelect
                label="Website URL"
                name="websiteKey"
                selectedLabel={huslWebName(websiteList, values?.websiteKey)}
                value={values?.websiteKey}
                error={errors?.websiteKey}
                items={[
                  {
                    label: 'Select Website',
                    value: ''
                  },
                  ...websiteList
                ]}
                setFieldValue={setFieldValue}
                hint={
                  <>
                    <span className="block mt-1">Choose a website you want to duplicate.</span>
                    {values?.websiteKey && (
                      <a href={huslWebPublicUrl(values?.websiteKey)} target="_blank" className="flex space-x-1 my-1.5">
                        <span>Visit Website</span>
                        <FiExternalLink />
                      </a>
                    )}
                  </>
                }
              />
            )}
            <div>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="flex items-center mt-5 space-x-2"
                loading={isSubmitting}>
                <MdSave />
                <span>Save Setting</span>
              </Button>
            </div>
          </div>
        </form>
      )}
    </Formik>
  )
}
