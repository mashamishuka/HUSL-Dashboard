import Button from '@components/Button'
import { createCustomer } from '@src/restapi/customers/mutation'
import { Formik } from 'formik'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { MdAdd } from 'react-icons/md'
import { toast } from 'react-toastify'
import { Dropzone, SingleSelect } from '../components'

import { Input } from '../components/Input'
import { customerSchema } from './schema'

const customerCreationInitial = {
  fullname: '',
  email: '',
  phone: '',
  gender: 'male',
  profilePicture: '',
  createdBy: ''
}

export const AddCustomer: React.FC = () => {
  const { data: session } = useSession()
  const { push } = useRouter()

  const handleAddCustomer = async (values: typeof customerCreationInitial) => {
    await createCustomer(values)
      .then((data) => {
        if (data?.status === 201 || data?.status === 200) {
          toast.success(data?.message)
          return push('/customer-portal')
        } else {
          toast.error(data?.message)
        }
      })
      .catch((e) => {
        toast.error(e?.response?.message || e?.message || 'Something went wrong while creating customer.')
      })
  }
  return (
    <Formik initialValues={customerCreationInitial} onSubmit={handleAddCustomer} validationSchema={customerSchema}>
      {({ values, handleChange, handleBlur, handleSubmit, errors, isSubmitting, setFieldValue }) => (
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div className="grid lg:grid-cols-2 lg:gap-x-16 gap-y-3 md:gap-y-0">
            <Dropzone
              label="Avatar"
              name="profilePicture"
              value={values?.profilePicture}
              onBlur={handleBlur}
              onChange={handleChange}
              setFieldValue={setFieldValue}
              accept={{
                'image/*': ['.jpeg', '.png']
              }}
            />
            {session?.id && (
              <input type="hidden" name="createdBy" value={session?.id} onBlur={handleBlur} onChange={handleChange} />
            )}
          </div>
          <div className="grid lg:grid-cols-2 lg:gap-x-16 gap-y-3 md:gap-y-0">
            <Input
              label="Fullname"
              placeholder="Enter your fullname"
              name="fullname"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values?.fullname}
              error={errors?.fullname}
            />
            <SingleSelect
              label="Select your gender"
              name="gender"
              items={[
                {
                  label: 'Male',
                  value: 'male'
                },
                {
                  label: 'Female',
                  value: 'female'
                }
              ]}
              onChange={handleChange}
              onBlur={handleBlur}
              value={values?.gender}
              error={errors?.gender}
              hideSearch
            />
          </div>
          <div className="grid lg:grid-cols-2 lg:gap-x-16 gap-y-3 md:gap-y-0">
            <Input
              label="Email"
              placeholder="Email"
              name="email"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values?.email}
              error={errors?.email}
            />
            <Input
              label="Phone"
              placeholder="Enter your phone"
              name="phone"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values?.phone}
              error={errors?.phone}
            />
          </div>
          <div>
            <Button
              type="submit"
              variant="outline"
              rounded="xl"
              className="flex items-center px-6 py-4 mt-5 mb-3 space-x-1 font-light"
              loading={isSubmitting}>
              <MdAdd />
              <span>Add Customer</span>
            </Button>
          </div>
        </form>
      )}
    </Formik>
  )
}
