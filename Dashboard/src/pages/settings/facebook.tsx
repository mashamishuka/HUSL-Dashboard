import { Wrapper } from '@components/Layouts/Wrapper'
import { FbAdsConfigForm } from '@components/Forms'

import type { NextLayoutComponentType } from 'next'
import { SettingsLayout } from '@components/Layouts/SettingsLayout'

const SettingsPage: NextLayoutComponentType = () => {
  return (
    <Wrapper title="Meta Ads Config" className="flex flex-col space-y-5">
      <FbAdsConfigForm />
    </Wrapper>
  )
}

SettingsPage.getLayout = function getLayout(page) {
  return <SettingsLayout children={page} />
}

export default SettingsPage
