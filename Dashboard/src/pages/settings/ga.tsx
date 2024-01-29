import { Wrapper } from '@components/Layouts/Wrapper'
import { GAConfigForm } from '@components/Forms'

import type { NextLayoutComponentType } from 'next'
import { SettingsLayout } from '@components/Layouts/SettingsLayout'

const GASettingsPage: NextLayoutComponentType = () => {
  return (
    <div>
      <Wrapper title="Google Analytics Config" className="flex flex-col space-y-5">
        <GAConfigForm />
      </Wrapper>
    </div>
  )
}

GASettingsPage.getLayout = function getLayout(page) {
  return <SettingsLayout children={page} />
}

export default GASettingsPage
