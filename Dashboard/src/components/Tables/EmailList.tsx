import moment from 'moment'

import { EmailInbox } from '@components/Icons'
import useSWR from 'swr'
import { GET_EMAIL_CAMPAIGNS } from '@src/restapi/emails/constants'
import { EmailCampaign } from '@src/restapi/emails/emails'
import { useHookstate } from '@hookstate/core'
import { mailCountState } from '@states/emails/mailCount'
import { useEffect } from 'react'

export const EmailListTable = () => {
  const { data } = useSWR<RestApi.Response<EmailCampaign[]>>(GET_EMAIL_CAMPAIGNS)
  const mailCount = useHookstate(mailCountState)

  useEffect(() => {
    if (data) {
      mailCount.set(data.data?.length)
    }
  }, [mailCount.get()])
  return (
    <table className="w-full text-left table-fixed md:table-auto">
      <thead>
        <tr>
          <th className="w-10 pr-8 md:pr-0"></th>
          <th className="w-56 pr-5 md:pr-0 md:w-auto"></th>
          <th className="w-20 md:w-auto"></th>
          <th className="w-14 md:w-auto"></th>
          <th className="w-14 md:w-auto"></th>
          <th className="w-14 md:w-auto"></th>
          <th className="w-14 md:w-auto"></th>
        </tr>
      </thead>
      <tbody>
        {data?.data?.map((campaign, index) => (
          <tr key={index}>
            <td className="py-2">
              <EmailInbox />
            </td>
            <td className="flex flex-col py-2">
              <span className="text-primary">{campaign?.subject}</span>
              <span className="text-xs font-light">{campaign?.name}</span>
              <span className="text-xs font-light">
                {moment(campaign?.delivery_at).format('DD MMM YYYY . HH:mm')} by {campaign?.from_name}
              </span>
            </td>
            <td className="py-2">
              <p>UID</p>
              <span className="text-xs">{campaign?.uid}</span>
            </td>
            <td className="py-2">
              <p>Type</p>
              <span className="text-xs">{campaign?.type}</span>
            </td>
            <td className="py-2">
              <p>Status</p>
              <span className="text-xs">{campaign?.status}</span>
            </td>
            <td className="py-2">
              <p>Created</p>
              <span className="text-xs">{moment(campaign?.created_at).format('DD MMM YYYY . HH:mm')}</span>
            </td>
            <td className="py-2">
              <p>Updated</p>
              <span className="text-xs">{moment(campaign?.updated_at).format('DD MMM YYYY . HH:mm')}</span>
            </td>
            {/* <td className="py-2">
              <Dropdown
                containerClass="justify-end"
                text={
                  <button className="flex items-center justify-end ml-auto space-x-1">
                    <span>View Report</span>
                    <MdArrowDropDown />
                  </button>
                }
                items={[
                  {
                    label: 'Yearly',
                    onClick: () => console.log('Yearly')
                  },
                  {
                    label: 'Monthly',
                    onClick: () => console.log('Monthly')
                  },
                  {
                    label: 'Weekly',
                    onClick: () => console.log('Weekly')
                  }
                ]}
              />
            </td> */}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
