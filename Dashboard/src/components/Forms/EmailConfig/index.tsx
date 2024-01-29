import { Formik } from 'formik'
import { MdSave } from 'react-icons/md'
import { toast } from 'react-toastify'

import Button from '@components/Button'
import { createEmailConfig } from '@src/restapi/emails/mutation'

import { Input } from '../components/Input'
import { emailConfigSchema } from './schema'

const emailConfigInitial = {
  token: ''
}

export const EmailConfigForm: React.FC = () => {
  const handleEmailConfig = async (values: typeof emailConfigInitial) => {
    try {
      const fbAdsConfig = await createEmailConfig(values)
      toast.success(fbAdsConfig?.message || 'FB Ads config saved successfully!')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Something went wrong. Please try again later.')
    }
  }
  return (
    <Formik
      initialValues={emailConfigInitial}
      onSubmit={handleEmailConfig}
      validationSchema={emailConfigSchema}
      enableReinitialize>
      {({ values, handleChange, handleBlur, handleSubmit, errors, isSubmitting }) => (
        <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
          <Input
            type="password"
            label="API Token"
            hint="HUSL Mail API token. The token stored is encrypted and safe."
            placeholder="diWpzL5Kl77myDgJ..."
            name="token"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values?.token}
            error={errors?.token}
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
