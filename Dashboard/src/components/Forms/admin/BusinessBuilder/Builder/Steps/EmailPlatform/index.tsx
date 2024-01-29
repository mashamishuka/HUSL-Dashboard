import Button from '@components/Button'
import { Formik } from 'formik'
import { emailPlatformSchema } from './schema'
import { Input } from '@components/Forms/components/Input'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { GET_EMAIL_CONFIG } from '@src/restapi/emails/constants'
import useSWR from 'swr'
import { EmailConfig } from '@src/restapi/emails/emails'
import { useBusiness } from '@hooks/useBusiness'
import { toast } from 'react-toastify'
import { createEmailConfig } from '@src/restapi/emails/mutation'

interface EmailPlatformProps {
  onNext?: (nextStepIndex: number, data?: Record<string, any>) => void
}
export const EmailPlatform: React.FC<EmailPlatformProps> = ({ onNext }) => {
  const { query } = useRouter()
  const businessId = query?.businessId as string
  const { data: business } = useBusiness(businessId)
  const userId = business?.data?.user?._id || null
  const { data } = useSWR<RestApi.Response<EmailConfig>>(userId ? `${GET_EMAIL_CONFIG}/${userId}` : null)

  const formInitialValues = useMemo(() => {
    return {
      huslMailApiKey: data?.data?.token
    }
  }, [data])

  const handleAddEmailPlatform = async (values: Record<string, any>) => {
    try {
      if (values?.huslMailApiKey) {
        await createEmailConfig({
          token: values?.huslMailApiKey,
          user: userId?.toString()
        })
      }
      // toast.success('Email platform connected successfully.')
      return onNext?.(5)
      // push('/admin/builder/business')
    } catch (error) {
      toast.error('Something went wrong, please try again later.')
    }
  }
  return (
    <div>
      <h1 className="mb-3">Connect to HUSL email platform</h1>
      <Formik
        initialValues={formInitialValues}
        onSubmit={handleAddEmailPlatform}
        validationSchema={emailPlatformSchema}
        enableReinitialize>
        {({ values, handleSubmit, errors, isSubmitting, handleBlur, handleChange }) => (
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col mb-5 space-y-3">
              <Input
                label="Enter HUSL Mail API Key"
                placeholder="HUSL Mail API Key"
                name="huslMailApiKey"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values?.huslMailApiKey}
                error={errors?.huslMailApiKey}
                hint={
                  <>
                    <p>Values are encrypted. You should re-add them if you wish to change them.</p>
                    <p>
                      Get API key from{' '}
                      <a href="https://mail.husl.app/account/api" target="_blank" className="underline text-primary">
                        HUSL Mail
                      </a>
                    </p>
                  </>
                }
              />
            </div>
            {values?.huslMailApiKey && <Button type="submit" text="Save & Continue" loading={isSubmitting} />}
            {!values?.huslMailApiKey && <Button type="submit" text="Skip" variant="outline" />}
          </form>
        )}
      </Formik>
    </div>
  )
}
