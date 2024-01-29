import Button from '@components/Button'
import { GET_CONFIG } from '@src/restapi/fbads/constants'
import { FbAdsConfig, FbAdsConfigDto } from '@src/restapi/fbads/fbads'
import { createFbAdsConfig } from '@src/restapi/fbads/mutation'
import { Formik } from 'formik'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import useSWR from 'swr'
import { SingleSelect } from '../components'
import { ErrorAlert } from '@components/Alerts'
import { useSetting } from '@hooks/useSetting'
import { useSession } from 'next-auth/react'

export const FbAdsConfigForm: React.FC = () => {
  const { query } = useRouter()
  const { value } = useSetting('fb-ads-token')
  const { value: adaccounts } = useSetting('fb-ads-account')
  const { data } = useSWR<RestApi.Response<FbAdsConfig>>(GET_CONFIG + '/' + query?.userId)
  const { data: session } = useSession()

  const handlePickAdAccount = async (values: Record<string, any>) => {
    if (!value || value === '') {
      toast.error('Access token is required.')
      return
    }
    try {
      const body: FbAdsConfigDto = {
        adAccountId: values?.adAccountId,
        token: value
      }
      if (session?.user?.role === 'admin' && query?.userId) {
        body.user = query?.userId?.toString()
      }
      const fbAdsConfig = await createFbAdsConfig(body)
      toast.success(fbAdsConfig?.message || 'FB Ads config saved successfully!')
      // push to remove the access token from the url
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Something went wrong. Please try again later.')
    }
  }

  return (
    <div>
      {adaccounts && adaccounts?.length > 0 ? (
        <Formik
          initialValues={{
            adAccountId: ''
          }}
          onSubmit={handlePickAdAccount}>
          {({ handleSubmit, setFieldValue }) => (
            <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
              <div>
                {adaccounts && (
                  <SingleSelect
                    label="Available Ad Account"
                    items={adaccounts?.map((adAccount: any) => ({
                      value: adAccount.id,
                      label: adAccount?.name || adAccount?.id
                    }))}
                    name="adAccountId"
                    setFieldValue={setFieldValue}
                    selectedLabel={adaccounts?.filter((v: any) => v.id === data?.data?.adAccountId)?.[0]?.name}
                    value={data?.data?.adAccountId}
                    hideSearch
                  />
                )}
              </div>
              <div>
                <Button type="submit" variant="outline" text="Save" size="sm" />
              </div>
            </form>
          )}
        </Formik>
      ) : (
        <ErrorAlert>No ad accounts found. Please ask admin to connect the ad account.</ErrorAlert>
      )}
    </div>
  )
}
