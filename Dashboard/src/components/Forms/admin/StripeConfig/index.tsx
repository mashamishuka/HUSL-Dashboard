import { Formik } from 'formik'
import { MdSave } from 'react-icons/md'

import Button from '@components/Button'

import { Input } from '../../components/Input'
import { stripeConfigSchema } from './schema'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { StripeConfig } from '@src/restapi/finances'
import { GET_STRIPE_CONFIG } from '@src/restapi/finances/constants'
import { createStripeConfig } from '@src/restapi/finances/mutation'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'

export const StripeConfigForm: React.FC = () => {
  const { query } = useRouter()
  const [stripeConfig, setStripeConfig] = useState({
    publishableKey: '',
    secretKey: '',
    whitelabelTag: ''
  })
  const { data } = useSWR<RestApi.Response<StripeConfig>>(`${GET_STRIPE_CONFIG}/${query.userId}`)

  const handleStripeConfig = async (values: typeof stripeConfig) => {
    try {
      const stripeConfig = await createStripeConfig({
        user: query.userId?.toString(),
        ...values
      })
      toast.success(stripeConfig?.message || 'Stripe config saved successfully!')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Something went wrong. Please try again later.')
    }
  }

  useEffect(() => {
    if (data?.data) {
      setStripeConfig({
        publishableKey: data?.data?.publishableKey,
        whitelabelTag: data?.data?.whitelabelTag || '',
        secretKey: ''
      })
    }
  }, [data])
  return (
    <Formik
      initialValues={stripeConfig}
      onSubmit={handleStripeConfig}
      validationSchema={stripeConfigSchema}
      enableReinitialize>
      {({ values, handleChange, handleBlur, handleSubmit, errors, isSubmitting }) => (
        <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
          <Input
            label="Whitelabel Tags"
            placeholder="Whitelabel Tags"
            name="whitelabelTag"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values?.whitelabelTag}
            error={errors?.whitelabelTag}
          />
          <Input
            label="Publishable Key"
            placeholder="pk_51LsoWhFiFdZ9qU290..."
            name="publishableKey"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values?.publishableKey}
            error={errors?.publishableKey}
          />
          <Input
            type="password"
            label="Secret Key"
            hint="Stripe secret key. The token stored is encrypted and safe."
            placeholder="sk_51LsoWhFiF..."
            name="secretKey"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values?.secretKey}
            error={errors?.secretKey}
          />
          <div>
            <Button type="submit" variant="outline" size="sm" className="flex items-center space-x-2" loading={isSubmitting}>
              <MdSave />
              <span>Save Setting</span>
            </Button>
          </div>
        </form>
      )}
    </Formik>
  )
}
