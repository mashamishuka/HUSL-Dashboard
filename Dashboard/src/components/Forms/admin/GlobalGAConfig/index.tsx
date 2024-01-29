import Button from '@components/Button'
import { MdLogin, MdRefresh } from 'react-icons/md'
import { useGoogleLogin } from '@react-oauth/google'
import { toast } from 'react-toastify'
import { useCookie } from 'react-use'
import api from '@services/api'
import { InfoAlert } from '@components/Alerts'
import { useSetting } from '@hooks/useSetting'
import { useState } from 'react'

export const GlobalGAConfigForm: React.FC = () => {
  const [GA_TOKEN, updateCookie] = useCookie('ga_token')
  const [, updateRefreshTokenCookie] = useCookie('ga_refresh_token')
  const { value } = useSetting('ga-config')
  const [refreshing, setRefreshing] = useState(false)

  const login = useGoogleLogin({
    onSuccess: async ({ code }) => {
      const { data: tokens }: RestApi.Response<any> = await api.post('/settings/ga-config', {
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

  const reconnectAccount = async () => {
    setRefreshing(true)
    try {
      const { data: tokens }: RestApi.Response<any> = await api.post('/settings/ga-config/refresh', {
        refreshToken: value?.refresh_token
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
      toast.success('Google account credentials refreshed.')
    } catch (_) {
      throw new Error('Something went wrong when refreshing credentials. Please try to reconnect the account.')
    }
    setRefreshing(false)
  }

  return (
    <InfoAlert className="mb-3" hideClose>
      <span className="block mb-3 text-base">
        As an admin, you should connect the master email that contain all analytics data.
      </span>
      {new Date().getTime() > value?.expiry_date && (
        <span className="block mb-3 text-sm font-light text-gray-200">
          Service might be <span className="text-danger">disconnected</span>. Try to click <b>Refresh Credentials</b> button
          bellow or try to reconnect the account.
        </span>
      )}
      <div className="flex items-center space-x-3">
        <Button
          type="button"
          variant="dark"
          size="sm"
          className="flex items-center px-3 space-x-2 border border-blue-500"
          onClick={() => login()}>
          <MdLogin />
          {GA_TOKEN ? <span>Reconnect Account</span> : <span>Connect Account</span>}
        </Button>
        {value?.access_token && (
          <Button
            type="button"
            variant="dark"
            size="sm"
            className="flex items-center px-3 space-x-2 border border-primary"
            onClick={() => reconnectAccount()}
            loading={refreshing}
            disabled={refreshing}>
            <MdRefresh />
            <span>Refresh Credentials</span>
          </Button>
        )}
      </div>
    </InfoAlert>
  )
}
