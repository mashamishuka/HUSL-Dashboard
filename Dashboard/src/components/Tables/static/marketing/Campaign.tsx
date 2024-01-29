// import { useList } from 'react-use'

import { Toggler } from '@components/Forms/components'
import { FbAdsCampaign } from '@src/restapi/fbads/fbads'
import useSWR from 'swr'
import { GET_FBADS_CAMPAIGN } from '@src/restapi/fbads/constants'
import { toast } from 'react-toastify'
import { updateCampaign } from '@src/restapi/fbads/mutation'
import { useEffect, useState } from 'react'
import { calcFbBudget } from '@utils/index'
import { useRouter } from 'next/router'
// import Button from '@components/Button'

export const CampaignTable = () => {
  const { data, mutate, error } = useSWR<RestApi.Response<FbAdsCampaign[]>>(GET_FBADS_CAMPAIGN)
  // const dummyArray = [...Array(5)]
  // const [checkedItems, { set, updateAt }] = useList<boolean>([])
  const [loading, setLoading] = useState<Record<string, any>>()
  const { push } = useRouter()

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
      const fbAdsConfig = await updateCampaign(campaignId, {
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

  const handleUpdateCampaign = async (campaignId: string, campaign?: Record<string, any>) => {
    const toastId = toast.loading('Updating, please wait...')
    setLoading({ [campaignId]: true })
    try {
      const fbAdsConfig = await updateCampaign(campaignId, campaign)
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
    <div>
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
            <th className="p-2 text-xl font-light border-r border-gray-700 whitespace-nowrap">Campaign Name</th>
            <th className="p-2 text-xl font-light border-r border-gray-700 whitespace-nowrap">Budget</th>
            <th className="p-2 text-xl font-light border-r border-gray-700 whitespace-nowrap">Remaining Budget</th>
            {/* <th className="w-10 p-2 text-xl font-light border-r border-gray-700 whitespace-nowrap">Actions</th> */}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {data?.data?.map((campaign, index) => (
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
                  defaultChecked={campaign?.status === 'ACTIVE'}
                  onSwitch={(checked) => handleChangeStatus(campaign?.id, checked, campaign?.status === 'ACTIVE')}
                  disabled={loading?.[campaign?.id]}
                />
              </td>
              <td
                className="p-2 text-xl border-r border-gray-700 text-primaryBlue"
                contentEditable
                suppressContentEditableWarning
                onBlur={(evt) => {
                  if (campaign?.name == evt?.currentTarget?.innerText?.replace('\n', '')) return
                  handleUpdateCampaign(campaign?.id, {
                    name: evt?.currentTarget?.innerText
                  })
                }}
                // on enter
                onKeyDown={(evt) => {
                  if (evt.key === 'Enter') {
                    evt.preventDefault()
                    evt.currentTarget.blur()
                  }
                }}>
                {campaign?.name}
              </td>
              <td className="p-2 text-xl border-r border-gray-700">
                {calcFbBudget(campaign?.lifetime_budget || campaign?.daily_budget)}
              </td>
              <td className="p-2 text-xl border-r border-gray-700">{calcFbBudget(campaign?.budget_remaining)}</td>
              {/* <td className="p-2 text-xl border-r border-gray-700">
                <div className="flex items-center justify-center">
                  <Button
                    text="Edit"
                    variant="none"
                    size="sm"
                    className="hover:underline !text-primary"
                    url={`/marketing/fb-ads/campaign/${campaign?.id}`}
                  />
                </div>
              </td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
