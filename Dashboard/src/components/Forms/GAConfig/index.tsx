import Button from '@components/Button'
import { Formik } from 'formik'
import { MdLogin, MdSave } from 'react-icons/md'
import { Input } from '../components/Input'
import { GAConfigSchema } from './schema'
import { useEffect, useState } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { createGAConfig } from '@src/restapi/ganalytics/mutation'
import { toast } from 'react-toastify'
import useSWR from 'swr'
import { GET_GA_CONFIG } from '@src/restapi/ganalytics/constants'
import { useCookie } from 'react-use'
import api from '@services/api'
import { InfoAlert } from '@components/Alerts'
// import QueryString from 'qs'
import { useMe } from '@hooks/useMe'

export const GAConfigForm: React.FC = () => {
  const [GA_TOKEN, updateCookie] = useCookie('ga_token')
  const [, updateRefreshTokenCookie] = useCookie('ga_refresh_token')

  const { data } = useSWR<RestApi.Response<GAnalyticConfig>>(GET_GA_CONFIG)
  const { data: user } = useMe()
  const [GAConfig, setGAConfig] = useState({
    clientId: '',
    propertyId: ''
  })

  const login = useGoogleLogin({
    onSuccess: async ({ code }) => {
      const { data: tokens }: RestApi.Response<any> = await api.post('/ganalytics/config/auth', {
        code
      })
      const ga_token = tokens?.data?.access_token
      const refresh_token = tokens?.data?.refresh_token
      api.defaults.headers.common.ga_token = ga_token
      api.defaults.headers.common.ga_refresh_token = refresh_token

      updateCookie(ga_token, {
        expires: new Date().getTime() + tokens?.data?.expiry_date * 1000
      })
      updateRefreshTokenCookie(refresh_token, {
        expires: new Date().getTime() + tokens?.data?.expiry_date + 30 * 6 * 24 * 60 * 60
      })
      toast.success('Google account connected successfully.')
      // update the saved data
      // const param = QueryString.stringify(
      //   {
      //     token: refresh_token
      //   },
      //   { skipNulls: true }
      // )
      // // page views
      // api.get(`${GET_GA_PAGE_VIEWS}?${param}`)
      // // page browser stats
      // api.get(`${GET_GA_BROWSERS}?${param}`)
    },
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    flow: 'auth-code'
  })

  const handleGAConfig = async (values: typeof GAConfig) => {
    try {
      const GAConfig = await createGAConfig(values)
      toast.success(GAConfig?.message || 'FB Ads config saved successfully!')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Something went wrong. Please try again later.')
    }
  }

  useEffect(() => {
    if (data?.data) {
      setGAConfig(data.data)
    }
  }, [data])

  return (
    <div>
      {user?.data?.role === 'admin' && (
        <InfoAlert className="mb-3">
          As an admin, you should connect the master email that contain all analytics data.
          <br />
          <Button
            type="button"
            variant="dark"
            size="sm"
            className="flex items-center px-3 mt-3 space-x-2 border border-blue-500"
            onClick={() => login()}>
            <MdLogin />
            {GA_TOKEN ? <span>Reconnect Account</span> : <span>Connect Account</span>}
          </Button>
        </InfoAlert>
      )}
      <Formik initialValues={GAConfig} onSubmit={handleGAConfig} validationSchema={GAConfigSchema} enableReinitialize>
        {({ values, handleChange, handleBlur, handleSubmit, errors, isSubmitting }) => (
          <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
            <Input
              type="number"
              label="Property ID"
              hint="Google Analytics V4 Property ID"
              placeholder="216272295"
              name="propertyId"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values?.propertyId}
              error={errors?.propertyId}
            />
            {/* <Input
              label="Client ID"
              hint="Google Client ID"
              placeholder="307****.apps.googleusercontent.com"
              name="clientId"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values?.clientId}
              error={errors?.clientId}
            /> */}
            {/* <Input
              type="password"
              label="Token"
              hint="Facebook Marketing API token. The token stored is encrypted and safe."
              placeholder="AIzaS*****Whw3lXVzwfxc"
              name="token"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values?.token}
              error={errors?.token}
            /> */}
            <div className="flex items-center space-x-3">
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
                loading={isSubmitting}>
                <MdSave />
                <span>Save Setting</span>
              </Button>
              {/* {GAConfig?.clientId && (
                <Button
                  type="button"
                  variant="dark"
                  size="sm"
                  className="flex items-center space-x-2 border border-blue-500"
                  onClick={() => login()}>
                  <MdLogin />
                  {GA_TOKEN ? <span>Reconnect Account</span> : <span>Connect Account</span>}
                </Button>
              )} */}
            </div>
          </form>
        )}
      </Formik>
    </div>
  )
}
