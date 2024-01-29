import Button from '@components/Button'
import { Dropzone, SingleSelect } from '@components/Forms/components'
import { EditPasswordModal } from '@components/Modals'
import { useUser } from '@hooks/useUser'
import { useWebsites } from '@hooks/useWebsites'
import { GET_ME } from '@src/restapi/users/constants'
import { editUser } from '@src/restapi/users/mutation'
import { huslWebEditorPublicUrl } from '@utils/index'
import { Formik } from 'formik'
import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'
import { FiExternalLink } from 'react-icons/fi'
import { MdEdit } from 'react-icons/md'
import { toast } from 'react-toastify'
import { mutate } from 'swr'

import { Input } from '../../components/Input'
import { editUserSchema } from './schema'

export const EditUserForm: React.FC = () => {
  const { query } = useRouter()
  const { data } = useUser(query?.userId as string)
  // fetch website list from api
  const { data: websites, loading } = useWebsites()
  const [showEditPasswordModal, setShowEditPasswordModal] = useState(false)

  const profileData = useMemo(() => {
    return {
      websiteKey: data?.data?.websiteKey || '',
      name: data?.data?.name || '',
      email: data?.data?.email || '',
      company: data?.data?.company || '',
      nftId: data?.data?.nftId || '',
      profilePicture: '',
      productUrl: data?.data?.productUrl || ''
    }
  }, [data, websites])

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

  const getWebsiteUrl = (code: string) => {
    const website = websites?.find((item) => item?.code === code)
    return website?.custom_domain || website?.sub_domain
  }

  const handleEditUser = async (values: typeof profileData) => {
    if (!data?.data?._id) return
    try {
      const editedUser = await editUser(data?.data?._id, values)
      toast.success('Profile updated successfully')
      mutate(GET_ME)
      mutate(`/users/${query?.userId}`)
      return editedUser
    } catch (e: any) {
      toast.error(e?.message)
    }
  }
  return (
    <div>
      <Formik initialValues={profileData} onSubmit={handleEditUser} validationSchema={editUserSchema} enableReinitialize>
        {({ values, handleChange, handleBlur, handleSubmit, errors, isSubmitting, setFieldValue }) => (
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <Dropzone
              label="Profile Picture"
              name="profilePicture"
              value={values?.profilePicture}
              current={data?.data?.profilePicture}
              onBlur={handleBlur}
              onChange={handleChange}
              setFieldValue={setFieldValue}
              accept={{
                'image/*': ['.jpeg', '.png']
              }}
            />
            <Input
              label="Full Name"
              placeholder="John Doe"
              name="name"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values?.name}
              error={errors?.name}
              required
            />
            <Input
              label="NFT ID"
              placeholder="0xF503cc14585Db***"
              name="nftId"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values?.nftId}
              error={errors?.nftId}
              required
            />
            <Input
              label="Email"
              placeholder="johndoe@gmail.com"
              name="email"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values?.email}
              error={errors?.email?.toString()}
            />
            <Input
              label="Company"
              placeholder="HUSL inc."
              name="company"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values?.company}
              error={errors?.company}
            />
            {!loading && (
              <SingleSelect
                label="Website URL"
                name="websiteKey"
                selectedLabel={getWebsiteUrl(values?.websiteKey)}
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
                  values?.websiteKey && (
                    <a href={huslWebEditorPublicUrl(values?.websiteKey)} target="_blank" className="flex space-x-1 mt-1.5">
                      <span>Visit Website</span>
                      <FiExternalLink />
                    </a>
                  )
                }
              />
            )}
            <Input
              label="Product URL"
              placeholder="https://wwww.example.com"
              name="productUrl"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values?.productUrl}
              error={errors?.productUrl?.toString()}
            />
            {/* <Input
              label="Website Url"
              placeholder="https://wwww.example.com"
              name="websiteKey"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values?.websiteKey}
              error={errors?.websiteKey}
            /> */}
            <div className="flex flex-col items-start space-y-3 lg:items-center md:space-x-3 md:flex-row md:space-y-0">
              <Button
                type="submit"
                variant="outline"
                rounded="xl"
                className="flex items-center px-6 py-4 space-x-1 font-light lg:items-start"
                loading={isSubmitting}>
                <MdEdit />
                <span>Edit Profile</span>
              </Button>
              <Button
                variant="dark"
                rounded="xl"
                className="flex items-center px-6 py-4 space-x-1 font-light lg:items-start"
                onClick={() => setShowEditPasswordModal(true)}>
                Change Password
              </Button>
            </div>
          </form>
        )}
      </Formik>
      <EditPasswordModal show={showEditPasswordModal} onClose={() => setShowEditPasswordModal(false)} data={data} />
    </div>
  )
}
