import { SettingsLayout } from '@components/Layouts/SettingsLayout'
import { Wrapper } from '@components/Layouts/Wrapper'

import type { NextLayoutComponentType } from 'next'
import { StripeConfigForm } from '@components/Forms/StripeConfig'
const StripeSettingsPage: NextLayoutComponentType = () => {
  return (
    <Wrapper title="Stripe Integration Settings" className="flex flex-col space-y-5">
      <StripeConfigForm />
    </Wrapper>
  )
}

StripeSettingsPage.getLayout = function getLayout(page) {
  return <SettingsLayout children={page} />
}

export default StripeSettingsPage
