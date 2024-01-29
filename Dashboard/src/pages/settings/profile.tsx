import { Wrapper } from '@components/Layouts/Wrapper'
import { EditUserForm } from '@components/Forms'

import { SettingsLayout } from '@components/Layouts/SettingsLayout'

import type { NextLayoutComponentType } from 'next'
const SettingsPage: NextLayoutComponentType = () => {
  return (
    <Wrapper title="Manage Profile" className="flex flex-col space-y-5">
      <EditUserForm />
    </Wrapper>
  )
}

SettingsPage.getLayout = function getLayout(page) {
  return <SettingsLayout children={page} />
}

export default SettingsPage
