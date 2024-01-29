import useSWR from 'swr'

import { SuccessAlert } from '@components/Alerts'
import { EmailConfigForm } from '@components/Forms'
import { SettingsLayout } from '@components/Layouts/SettingsLayout'
import { Wrapper } from '@components/Layouts/Wrapper'
import { GET_EMAIL_CONFIG } from '@src/restapi/emails/constants'
import { EmailConfig } from '@src/restapi/emails/emails'

import type { NextLayoutComponentType } from 'next'
const EmailSettingsPage: NextLayoutComponentType = () => {
  const { data } = useSWR<RestApi.Response<EmailConfig>>(GET_EMAIL_CONFIG)

  return (
    <Wrapper title="Email Settings" className="flex flex-col space-y-5">
      {data?.data?.token && <SuccessAlert className="mb-5">You have connected your HUSL Mail account API.</SuccessAlert>}
      <EmailConfigForm />
    </Wrapper>
  )
}

EmailSettingsPage.getLayout = function getLayout(page) {
  return <SettingsLayout children={page} />
}

export default EmailSettingsPage
