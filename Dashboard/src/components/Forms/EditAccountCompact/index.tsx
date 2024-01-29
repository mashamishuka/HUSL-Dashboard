import Button from '@components/Button'
import { AccountDto } from '@src/restapi/accounts/account'
import { GET_ALL_ACCOUNT } from '@src/restapi/accounts/constants'
import { editAccount } from '@src/restapi/accounts/mutation'
import { Formik } from 'formik'
import { useMemo } from 'react'
import { MdEdit } from 'react-icons/md'
import { toast } from 'react-toastify'
import { mutate } from 'swr'

import { Input } from '../components/Input'
import { addAccountSchema } from './schema'

interface EditAccountCompactProps {
  data?: AccountDto & {
    _id: string
  }
}
export const EditAccountCompact: React.FC<EditAccountCompactProps> = ({ data }) => {
  const handleEditAccount = async (values: any) => {
    if (!data?._id) return
    try {
      const account = await editAccount(data?._id, values)
      if (account) {
        toast.success(account?.message || 'Account created successfully!')
        mutate(GET_ALL_ACCOUNT)
      } else {
        toast.error('Something went wrong. Please try again later.')
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Something went wrong. Please try again later.')
    }
  }
  const editAccountInitial = useMemo(() => {
    return {
      websiteKey: data?.websiteKey,
      username: data?.username,
      password: data?.password
    }
  }, [data])
  return (
    <Formik initialValues={editAccountInitial} onSubmit={handleEditAccount} validationSchema={addAccountSchema}>
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
          <div>
            <Button
              type="submit"
              variant="outline"
              rounded="xl"
              className="flex items-center mt-3 space-x-1 font-light"
              loading={isSubmitting}
              size="sm">
              <MdEdit />
              <span>Edit Account</span>
            </Button>
          </div>
        </form>
      )}
    </Formik>
  )
}
