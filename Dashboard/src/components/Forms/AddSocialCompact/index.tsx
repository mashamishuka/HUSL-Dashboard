import Button from '@components/Button'
import { useActiveBusiness } from '@hooks/useActiveBusiness'
import { GET_ALL_SOCIAL_ACCOUNT } from '@src/restapi/accounts/constants'
import { createSocialAccount } from '@src/restapi/accounts/mutation'
import { Formik } from 'formik'
import { MdAdd } from 'react-icons/md'
import { toast } from 'react-toastify'
import { mutate } from 'swr'
import { SingleSelect } from '../components'

import { Input } from '../components/Input'
import { addAccountSchema } from './schema'

const accountCreationInitial = {
  websiteList: '',
  username: '',
  password: '',
  social: 'fb' as 'fb' | 'twitter' | 'tiktok' | 'ig'
}

interface AddSocialCompactProps {
  hideSubmit?: boolean
}
export const AddSocialCompact: React.FC<AddSocialCompactProps> = ({ hideSubmit }) => {
  const { business: activeBusiness } = useActiveBusiness()
  const handleAddAccount = async (values: typeof accountCreationInitial) => {
    try {
      const socialAccount = await createSocialAccount(values)
      mutate?.(activeBusiness ? GET_ALL_SOCIAL_ACCOUNT + `?businessId=${activeBusiness._id}` : null)
      toast.success(socialAccount?.message || 'Social account saved successfully!')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Something went wrong. Please try again later.')
    }
  }
  return (
    <Formik initialValues={accountCreationInitial} onSubmit={handleAddAccount} validationSchema={addAccountSchema}>
      {({ values, handleChange, handleBlur, handleSubmit, errors, isSubmitting, setFieldValue }) => (
        <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
          <SingleSelect
            name="social"
            label="Social"
            setFieldValue={setFieldValue}
            value={values?.social}
            error={errors?.social}
            hideSearch
            variant="dark"
            items={[
              {
                label: 'Facebook',
                value: 'fb'
              },
              {
                label: 'Instagram',
                value: 'ig'
              },
              {
                label: 'Twitter',
                value: 'twitter'
              },
              {
                label: 'Tiktok',
                value: 'tiktok'
              }
            ]}
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
          {!hideSubmit && (
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
          )}
        </form>
      )}
    </Formik>
  )
}
