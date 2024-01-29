import Button from '@components/Button'
import { useRouter } from 'next/router'
import { MouseEvent, useCallback, useEffect } from 'react'
import { MdLogin } from 'react-icons/md'
import { toast } from 'react-toastify'
import qs from 'qs'
import { createSetting } from '@src/restapi/setting/mutation'
import { useSetting } from '@hooks/useSetting'
import { SuccessAlert, WarningAlert } from '@components/Alerts'
import api from '@services/api'

export const MasterFbAdsConfigForm: React.FC = () => {
  const router = useRouter()
  const { value } = useSetting('fb-ads-token')

  const getFbAdsAccount = async () => {
    const url = router?.asPath?.replace('#', '')?.split('?')
    const query = qs.parse(url?.[1])
    const accessToken = query?.access_token?.toString() || ''
    if (!accessToken) {
      return
    }

    try {
      const adAccounts = await api
        .get(`https://graph.facebook.com/v16.0/me?access_token=${accessToken}&fields=adaccounts{name}`)
        .then((res) => {
          return res?.data?.adaccounts?.data
        })
      await createSetting({
        key: 'fb-ads-token',
        value: accessToken
      })
      await createSetting({
        key: 'fb-ads-account',
        value: adAccounts
      })

      toast.success('FB Ads config saved successfully!')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Something went wrong. Please try again later.')
    }
  }

  const handleQuickConnect = useCallback(
    (evt: MouseEvent<HTMLButtonElement>) => {
      evt.stopPropagation()
      const referer = window.location.href
      // todo client id to env
      window.open(
        `https://www.facebook.com/v16.0/dialog/oauth?client_id=102654706162731&redirect_uri=${referer}&response_type=token&scope=ads_management,ads_read`
      )
      // window.location.href = `https://www.facebook.com/v16.0/dialog/oauth?client_id=391868683159007&redirect_uri=${referer}&response_type=token&scope=ads_management,ads_read`
    },
    [router]
  )

  useEffect(() => {
    getFbAdsAccount()
  }, [])

  return (
    <div>
      {!value ? (
        <WarningAlert>
          <p className="text-sm">You need to connect Facebook to use this feature.</p>
        </WarningAlert>
      ) : (
        <SuccessAlert>
          <p className="text-sm">You have connected Facebook. You can try to reconnect if needed.</p>
        </SuccessAlert>
      )}
      <Button
        type="button"
        variant="dark"
        size="sm"
        className="flex items-center mt-5 space-x-2 border border-blue-500"
        onClick={handleQuickConnect}>
        <MdLogin />
        <span>{value ? 'Reconnect Facebook' : 'Connect Facebook'}</span>
      </Button>
    </div>
  )
}
