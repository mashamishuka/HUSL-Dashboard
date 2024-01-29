import Button from '@components/Button'
import api from '@services/api'
import { GET_ALL_ACCOUNT } from '@src/restapi/accounts/constants'
import { Formik } from 'formik'
import { MdAdd } from 'react-icons/md'
import { toast } from 'react-toastify'
import { mutate } from 'swr'
import { Checkbox } from '../components'

import { Input } from '../components/Input'
import { addAccountSchema } from './schema'

const accountCreationInitial = {
  websiteKey: '',
  username: '',
  password: ''
}

export const AddAccountCompact: React.FC = () => {
  const handleAddAccount = async (values: typeof accountCreationInitial) => {
    await api
      .post(`/accounts`, values)
      .then(({ data }) => {
        toast.success(data?.message || 'Account created successfully!')
        mutate(GET_ALL_ACCOUNT)
      })
      .catch((e) => {
        toast.error(e?.response?.data?.message || 'Something went wrong. Please try again later.')
      })
  }
  return (
    <Formik initialValues={accountCreationInitial} onSubmit={handleAddAccount} validationSchema={addAccountSchema}>
      {({ values, handleChange, handleBlur, handleSubmit, errors, isSubmitting }) => (
        <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
          <Input
            placeholder="Website Url"
            name="websiteKey"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values?.websiteKey}
            error={errors?.websiteKey}
            variant="dark"
          />
          <Input
            placeholder="Username"
            name="username"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values?.username}
            error={errors?.username}
            variant="dark"
          />
          <Input
            type="password"
            placeholder="Password"
            name="password"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values?.password}
            error={errors?.password}
            variant="dark"
          />
          <Checkbox
            items={[
              {
                label: 'Add later'
              }
            ]}
            labelClassName="!text-white text-sm"
          />
          <div>
            <Button
              type="submit"
              variant="outline"
              rounded="xl"
              className="flex items-center mt-3 space-x-1 font-light"
              loading={isSubmitting}
              size="sm">
              <MdAdd />
              <span>Add Account</span>
            </Button>
          </div>
        </form>
      )}
    </Formik>
  )
}
