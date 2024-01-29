import Button from '@components/Button'
import { Customer, CustomerDto } from '@src/restapi/customers/customers'
import { updateCustomer } from '@src/restapi/customers/mutation'
import { Formik } from 'formik'
import { useRouter } from 'next/router'
import { MdEdit } from 'react-icons/md'
import { toast } from 'react-toastify'
import { Dropzone, SingleSelect } from '../components'

import { Input } from '../components/Input'
import { customerSchema } from './schema'

interface EditCustomerProps {
  customerId: string
  initialValues: Omit<Customer, 'trashed'>
}

export const EditCustomer: React.FC<EditCustomerProps> = ({ customerId, initialValues }) => {
  const { push } = useRouter()

  const handleEditCustomer = async (values: Customer) => {
    await updateCustomer(customerId, values as CustomerDto)
      .then((data) => {
        if (data?.status === 200) {
          toast.success(data?.message)
          return push('/customer-portal')
        } else {
          toast.error(data?.message)
        }
      })
      .catch((e) => {
        toast.error(e?.response?.message || e?.message || 'Something went wrong while updating customer.')
      })
  }

  return (
    <Formik initialValues={initialValues} onSubmit={handleEditCustomer} validationSchema={customerSchema} enableReinitialize>
      {({ values, handleChange, handleBlur, handleSubmit, errors, isSubmitting, setFieldValue }) => (
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div className="grid lg:grid-cols-2 lg:gap-x-16 gap-y-3 md:gap-y-0">
            <Dropzone
              label="Avatar"
              name="profilePicture"
              value={values?.profilePicture?._id}
              onBlur={handleBlur}
              onChange={handleChange}
              setFieldValue={setFieldValue}
              current={values?.profilePicture?.url}
              accept={{
                'image/*': ['.jpeg', '.png']
              }}
            />
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
              <MdEdit />
              <span>Edit Customer</span>
            </Button>
          </div>
        </form>
      )}
    </Formik>
  )
}
