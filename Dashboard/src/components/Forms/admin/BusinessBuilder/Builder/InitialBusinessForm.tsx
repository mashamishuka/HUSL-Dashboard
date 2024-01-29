import { Formik } from 'formik'
import { useRouter } from 'next/router'
import { MdSave } from 'react-icons/md'
import { toast } from 'react-toastify'

import Button from '@components/Button'
import { Input } from '@components/Forms/components/Input'

import { initialBusinessCreationSchema } from './schema'
import { createBusiness } from '@src/restapi/businesses/mutation'
import { CreateBusinessDto } from '@src/restapi/businesses/business'

const addBusinessInitial = {
  name: ''
}

export const InitialBusinessForm: React.FC = () => {
  const router = useRouter()
  const handleAddBusiness = async (values: CreateBusinessDto) => {
    try {
      const business = await createBusiness(values)
      toast.success('Business created successfully!')
      router.push(`/admin/builder/business/${business?.data?._id}`)
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Something went wrong. Please try again later.')
    }
  }
  return (
    <Formik
      initialValues={addBusinessInitial}
      onSubmit={handleAddBusiness}
      validationSchema={initialBusinessCreationSchema}
      enableReinitialize>
      {({ values, handleChange, handleBlur, handleSubmit, errors, isSubmitting }) => (
        <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
          <Input
            label="Business Name"
            placeholder="example: HUSL"
            name="name"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values?.name}
            error={errors?.name}
            required
          />

          <div>
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
