import Button from '@components/Button'
import api from '@services/api'
import { CREATE_USER, GET_USERS } from '@src/restapi/users/constants'
import { Formik } from 'formik'
import { toast } from 'react-toastify'
import { mutate } from 'swr'
import { Checkbox } from '../components'

import { Input } from '../components/Input'
import { addUserSchema } from './schema'

const userCreationInitial = {
  name: '',
  nftId: '',
  addLater: false
}

export const AddUserForm: React.FC = () => {
  const handleAddUser = async (values: typeof userCreationInitial) => {
    await api
      .post(CREATE_USER, values)
      .then(({ data }) => {
        toast.success(data?.message || 'User created successfully!')
        mutate(GET_USERS)
      })
      .catch((e) => {
        toast.error(e?.response?.data?.message || 'Something went wrong. Please try again later.')
      })
  }
  return (
    <Formik initialValues={userCreationInitial} onSubmit={handleAddUser} validationSchema={addUserSchema}>
      {({ values, handleChange, handleBlur, handleSubmit, errors, isSubmitting }) => (
        <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
          <Input
            placeholder="Name"
            name="name"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values?.name}
            error={errors?.name}
            variant="dark"
          />
          <Input
            placeholder="NFT ID"
            name="nftId"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values?.nftId}
            error={errors?.nftId}
            variant="dark"
          />
          <Checkbox
            items={[
              {
                label: 'Add later'
              }
            ]}
            name="addLater"
            labelClassName="!text-white text-sm"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values?.addLater?.toString()}
          />
          <div>
            <Button
              type="submit"
              variant="outline"
              rounded="xl"
              className="flex items-center mt-3 space-x-1 font-light"
              loading={isSubmitting}
              size="sm">
              <span>Add User</span>
            </Button>
          </div>
        </form>
      )}
    </Formik>
  )
}
