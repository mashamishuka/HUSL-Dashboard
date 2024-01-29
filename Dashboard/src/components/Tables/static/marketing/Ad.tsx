// import { useList } from 'react-use'

import { Toggler } from '@components/Forms/components'
import useSWR from 'swr'
import { useEffect, useState } from 'react'
import { FbAdsAd } from '@src/restapi/fbads/fbads'
import { GET_FBADS_ADS } from '@src/restapi/fbads/constants'
import { cutString } from '@utils/index'
import { toast } from 'react-toastify'
import { updateAds } from '@src/restapi/fbads/mutation'
import { useRouter } from 'next/router'

export const MarketingAdTable = () => {
  const { data, mutate, error } = useSWR<RestApi.Response<FbAdsAd[]>>(GET_FBADS_ADS)
  const [loading, setLoading] = useState<Record<string, any>>()
  const { push } = useRouter()

  // const dummyArray = [...Array(5)]
  // const [checkedItems, { set, updateAt }] = useList<boolean>([])

  // const handleToggleAll = (checked: boolean) => {
  //   if (checked) {
  //     set(dummyArray.map(() => true))
  //   } else {
  //     set([])
  //   }
  // }

  const handleChangeStatus = async (campaignId: string, active?: boolean, currentActiveStatus?: boolean) => {
    if (active === currentActiveStatus) return
    const toastId = toast.loading('Updating, please wait...')
    setLoading({ [campaignId]: true })
    try {
      const fbAdsConfig = await updateAds(campaignId, {
        status: active ? 'ACTIVE' : 'PAUSED'
      })
      mutate()
      setLoading({ [campaignId]: false })
      toast.update(toastId, {
        type: 'success',
        render: fbAdsConfig?.message || 'FB Ads config saved successfully!',
        isLoading: false,
        autoClose: 3000,
        toastId: 'update-fbads-config'
      })
    } catch (e: any) {
      setLoading({ [campaignId]: false })
      // also mutate when error to prevent toggle being missmatched
      mutate()
      toast.update(toastId, {
        type: 'error',
        render: e?.response?.data?.message || 'Something went wrong. Please try again later.',
        isLoading: false,
        autoClose: 3000,
        toastId: 'update-fbads-config'
      })
    }
  }

  useEffect(() => {
    if (error) {
      toast.warning(
        'You may have not connected your Facebook account yet or auth session expired. Click here to reconnect.',
        {
          toastId: 'FB_CONFIG_ERROR',
          position: 'bottom-right',
          autoClose: false,
          draggable: true,
          onClick: () => push('/settings/facebook')
        }
      )
    }
    return () => {
      toast.dismiss('FB_CONFIG_ERROR')
    }
  }, [error])

  return (
    <table className="w-full text-left border border-gray-700 table-auto">
      <thead>
        <tr className="border-b border-gray-700">
          {/* <th className="w-8 px-3 text-xl font-light text-center border-r border-gray-700">
            <div className="flex items-center justify-center">
              <Checkboxes
                items={{
                  label: ''
                }}
                onChange={(evt) => handleToggleAll(evt?.currentTarget?.checked)}
              />
            </div>
          </th> */}
          <th className="w-24 p-2 text-xl font-light border-r border-gray-700 whitespace-nowrap">Off/On</th>
          <th className="p-2 text-xl font-light border-r border-gray-700 whitespace-nowrap">Ads Name</th>
          <th className="p-2 text-xl font-light border-r border-gray-700 whitespace-nowrap">AdSet</th>
          <th className="p-2 text-xl font-light border-r border-gray-700 whitespace-nowrap">Campaign</th>
          <th className="p-2 text-xl font-light border-r border-gray-700 whitespace-nowrap">Ad Creative</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-700">
        {data?.data?.map((ad) => (
          <tr key={ad?.id}>
            {/* <td className="px-3 border-r border-gray-700">
              <div className="flex items-center justify-center">
                <Checkboxes
                  items={{
                    label: ''
                  }}
                  onChange={() => updateAt(index, !checkedItems[index])}
                  checked={checkedItems?.[index] || false}
                  disabled={!data && !error}
                />
              </div>
            </td> */}
            <td className="p-2 text-center border-r border-gray-700">
              <Toggler
                defaultChecked={ad?.status === 'ACTIVE'}
                onSwitch={(checked) => handleChangeStatus(ad?.id, checked, ad?.status === 'ACTIVE')}
                disabled={loading?.[ad?.id]}
              />
            </td>
            <td className="p-2 text-xl border-r border-gray-700 text-primaryBlue">{ad?.name}</td>
            <td className="p-2 text-xl border-r border-gray-700 cursor-pointer text-primaryBlue" title={ad?.adset?.id}>
              {ad?.adset?.name}
            </td>
            <td className="p-2 text-xl border-r border-gray-700 cursor-pointer text-primaryBlue" title={ad?.campaign?.id}>
              {ad?.campaign?.name}
            </td>
            <td className="p-2 text-xl border-r border-gray-700 cursor-pointer text-primaryBlue" title={ad?.creative?.name}>
              {cutString(ad?.creative?.name || '', 0, 20)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
