import { Formik } from 'formik'
import { useMemo } from 'react'

import Button from '@components/Button'
import { Dropzone, TextArea } from '@components/Forms/components'
import { ColorPicker } from '@components/Forms/components/ColorPicker'

import { brandDetailSchema } from './schema'
import { useRouter } from 'next/router'
import { useBusiness } from '@hooks/useBusiness'
// import { toast } from 'react-toastify'

interface BusinessBrandDetailProps {
  nextText?: string
}
export const BusinessBrandDetail: React.FC<BusinessBrandDetailProps> = ({ nextText = 'Save & Continue' }) => {
  const { query } = useRouter()
  const businessId = query?.businessId as string
  const { data } = useBusiness(businessId)

  const formInitialValues = useMemo(() => {
    // TODO add initial values from API or kept empty
    return {
      logo: data?.data?.logo?._id || '',
      favicon: data?.data?.favicon?._id || '',
      primaryColor: data?.data?.primaryColor || '',
      secondaryColor: data?.data?.secondaryColor || '',
      customFields: data?.data?.customFields || {}
    }
  }, [])
  const handleWebsiteGenerateProcess = (values: Record<string, any>) => {
    // if (data?.data?.generated) {
    //   toast.error('Website is already generated')
    //   return
    // }
    console.log(values)
    return
  }
  return (
    <Formik
      initialValues={formInitialValues}
      onSubmit={handleWebsiteGenerateProcess}
      validationSchema={brandDetailSchema}
      enableReinitialize>
      {({ values, handleSubmit, errors, isSubmitting, handleBlur, handleChange, setFieldValue }) => (
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col mb-5 space-y-3">
            <TextArea
              label="Welcome Text"
              placeholder="Enter welcome text"
              name="customFields.welcomeText"
              hint="Shown in Brand Overview. Brackets are supported."
              onChange={handleChange}
              onBlur={handleBlur}
              value={values?.customFields?.welcomeText}
              required
            />
            <TextArea
              label="Social Media Bio"
              placeholder="Enter Social Media Bio"
              name="customFields.socialMediaBio"
              hint="Shown in Brand Overview. Brackets are supported."
              onChange={handleChange}
              onBlur={handleBlur}
              value={values?.customFields?.socialMediaBio}
            />
            <Dropzone
              label="Upload Business Logo"
              name="logo"
              accept={{
                'image/*': ['.jpeg', '.png']
              }}
              value={values?.logo}
              setFieldValue={setFieldValue}
              current={data?.data?.logo?.url}
              compact
              required
            />
            <Dropzone
              label="Upload Business Icon"
              name="favicon"
              accept={{
                'image/*': ['.jpeg', '.png']
              }}
              value={values?.favicon || ''}
              setFieldValue={setFieldValue}
              current={data?.data?.favicon?.url}
              compact
              required
            />
            <ColorPicker
              label="Primary Color"
              name="primaryColor"
              setFieldValue={setFieldValue}
              value={values?.primaryColor}
              error={errors?.primaryColor}
              required
            />
            <ColorPicker
              label="Secondary Color"
              name="secondaryColor"
              setFieldValue={setFieldValue}
              value={values?.secondaryColor}
              error={errors?.secondaryColor}
              required
            />
          </div>
          <Button type="submit" text={nextText} disabled={data?.data?.generated} loading={isSubmitting} />
        </form>
      )}
    </Formik>
  )
}
