import useSWR from 'swr'

import { SuccessAlert } from '@components/Alerts'
import { EmailConfigForm } from '@components/Forms/admin/EmailConfig'
import { Wrapper } from '@components/Layouts/Wrapper'
import { GET_EMAIL_CONFIG } from '@src/restapi/emails/constants'
import { EmailConfig } from '@src/restapi/emails/emails'

import { AdminUserConfigLayout } from '@components/Layouts/AdminUserConfig'

import type { NextLayoutComponentType } from 'next'
import { useRouter } from 'next/router'
import { MdChevronLeft } from 'react-icons/md'

const EmailSettingsPage: NextLayoutComponentType = () => {
  const { query, push } = useRouter()
  const { data } = useSWR<RestApi.Response<EmailConfig>>(`${GET_EMAIL_CONFIG}/${query?.userId}`)

  return (
    <div>
      <button onClick={() => push('/admin/accounts')} className="flex items-center mb-3 space-x-2">
        <MdChevronLeft size={16} />
        <span>Back to Account List</span>
      </button>
      <Wrapper title="Email Settings" className="flex flex-col space-y-5">
        {data?.data?.token && <SuccessAlert className="mb-5">You have connected your HUSL Mail account API.</SuccessAlert>}
        <EmailConfigForm />
      </Wrapper>
    </div>
  )
}

EmailSettingsPage.getLayout = function getLayout(page) {
  return <AdminUserConfigLayout children={page} />
}

export default EmailSettingsPage
