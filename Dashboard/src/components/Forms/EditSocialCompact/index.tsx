import Button from '@components/Button'
import { SocialAccountDto } from '@src/restapi/accounts/account'
import { GET_ALL_SOCIAL_ACCOUNT } from '@src/restapi/accounts/constants'
import { editSocialAccount } from '@src/restapi/accounts/mutation'
import { Formik } from 'formik'
import { useMemo } from 'react'
import { MdEdit } from 'react-icons/md'
import { toast } from 'react-toastify'
import { mutate } from 'swr'
import { SingleSelect } from '../components'

import { Input } from '../components/Input'
import { editSocialSchema } from './schema'

interface EditSocialCompactProps {
  data?: SocialAccountDto & {
    _id: string
  }
}
export const EditSocialCompact: React.FC<EditSocialCompactProps> = ({ data }) => {
  const handleEditAccount = async (values: any) => {
    if (!data?._id) return
    try {
      const account = await editSocialAccount(data?._id, values)
      if (account) {
        toast.success(account?.message || 'Social account created successfully!')
        mutate(GET_ALL_SOCIAL_ACCOUNT)
      } else {
        toast.error('Something went wrong. Please try again later.')
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Something went wrong. Please try again later.')
    }
  }
  const editAccountInitial = useMemo(() => {
    return {
      social: data?.social,
      websiteList: data?.websiteList,
      username: data?.username,
      password: data?.password
    }
  }, [data])
  return (
    <Formik initialValues={editAccountInitial} onSubmit={handleEditAccount} validationSchema={editSocialSchema}>
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
            placeholder="Website List"
            name="websiteList"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values?.websiteList}
            error={errors?.websiteList}
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
              <span>Edit Social Account</span>
            </Button>
          </div>
        </form>
      )}
    </Formik>
  )
}
