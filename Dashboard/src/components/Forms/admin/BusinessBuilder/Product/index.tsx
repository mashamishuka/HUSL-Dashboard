import { Formik } from 'formik'
import { useMemo } from 'react'
import { FiExternalLink } from 'react-icons/fi'
import { MdSave } from 'react-icons/md'
import { toast } from 'react-toastify'

import Button from '@components/Button'
import { SingleSelect } from '@components/Forms/components'
import { Input } from '@components/Forms/components/Input'
import { useWebsites } from '@hooks/useWebsites'
import { huslWebPublicUrl, huslWebName } from '@utils/index'

import { addProductSchema } from './schema'
import { createProduct } from '@src/restapi/products/mutation'
import { useRouter } from 'next/router'

const addProductInitial = {
  websiteKey: '',
  name: ''
}

export const CreateProductForm: React.FC = () => {
  const router = useRouter()
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

  const handleAddProduct = async (values: CreateProductDto) => {
    try {
      await createProduct(values).then((res) => {
        if (res?.data?._id) {
          toast.success('Product created successfully.')
          router?.push('/admin/builder/product')
        }
      })
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Something went wrong. Please try again later.')
    }
  }
  return (
    <Formik
      initialValues={addProductInitial}
      onSubmit={handleAddProduct}
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

          <div>
            {!loading && (
              <SingleSelect
                label="Choose Website"
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
