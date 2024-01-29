import Button from '@components/Button'
import { Formik } from 'formik'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'

import { Input } from '../components/Input'
import { adminLoginSchema } from './schema'

const adminLoginInitial = {
  identifier: '',
  password: ''
}

export const AdminLoginForm: React.FC = () => {
  const { query, replace, prefetch } = useRouter()
  const handleAddUser = async (values: typeof adminLoginInitial) => {
    const auth = await signIn('admin', {
      redirect: false,
      ...values
    })
    prefetch('/admin/accounts')
    if (auth?.ok) {
      replace(query?.callbackUrl?.toString() || '/admin/accounts')
    } else {
      toast.error('Your password or identifier is incorrect.')
    }
  }
  return (
    <Formik initialValues={adminLoginInitial} onSubmit={handleAddUser} validationSchema={adminLoginSchema}>
      {({ values, handleChange, handleBlur, handleSubmit, errors, isSubmitting }) => (
        <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
          <Input
            placeholder="Enter your email or NFT ID"
            name="identifier"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values?.identifier}
            error={errors?.identifier}
            label="Email or NFT ID"
            required
          />
          <Input
            type="password"
            placeholder="Enter your password"
            name="password"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values?.password}
            error={errors?.password}
            label="Password"
            required
          />
          <div>
            <Button
              type="submit"
              variant="outline"
              rounded="xl"
              className="flex items-center mt-3 space-x-1 font-light"
              loading={isSubmitting}
              size="sm">
              <span>Sign In</span>
            </Button>
          </div>
        </form>
      )}
    </Formik>
  )
}
