// import { useList } from 'react-use'

import { Toggler } from '@components/Forms/components'
import useSWR from 'swr'
import { FbAdsAdsets } from '@src/restapi/fbads/fbads'
import { GET_FBADS_ADSETS } from '@src/restapi/fbads/constants'
import { calcFbBudget } from '@utils/index'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { updateAdSet } from '@src/restapi/fbads/mutation'
import { useRouter } from 'next/router'

export const AdSetTable = () => {
  const { data, mutate, error } = useSWR<RestApi.Response<FbAdsAdsets[]>>(GET_FBADS_ADSETS)
  const [loading, setLoading] = useState<Record<string, any>>()
  const { push } = useRouter()

  // const dummyArray = [...Array(data?.data?.length)]
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
      const fbAdsConfig = await updateAdSet(campaignId, {
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
          <th className="p-2 text-xl font-light border-r border-gray-700 whitespace-nowrap">Ad Set</th>
          <th className="p-2 text-xl font-light border-r border-gray-700 whitespace-nowrap">Budget Remaining</th>
          <th className="p-2 text-xl font-light border-r border-gray-700 whitespace-nowrap">Optimazion Goal</th>
          <th className="p-2 text-xl font-light border-r border-gray-700 whitespace-nowrap">Is Dynamic Creative</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-700">
        {data?.data?.map((adset, index) => (
          <tr key={index}>
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
                defaultChecked={adset?.status === 'ACTIVE'}
                onSwitch={(checked) => handleChangeStatus(adset?.id, checked, adset?.status === 'ACTIVE')}
                disabled={loading?.[adset?.id]}
              />
            </td>
            <td className="p-2 text-xl border-r border-gray-700 text-primaryBlue">{adset?.name}</td>
            <td className="p-2 text-xl border-r border-gray-700">{calcFbBudget(adset?.budget_remaining)}</td>
            <td className="p-2 text-xl border-r border-gray-700">{adset?.optimization_goal}</td>
            <td className="p-2 text-xl border-r border-gray-700">{adset?.is_dynamic_creative ? 'TRUE' : 'FALSE'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
