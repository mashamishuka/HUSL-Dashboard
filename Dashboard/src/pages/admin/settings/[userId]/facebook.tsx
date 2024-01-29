import { Wrapper } from '@components/Layouts/Wrapper'
import { FbAdsConfigForm } from '@components/Forms/admin/FbAdsConfig'

import type { NextLayoutComponentType } from 'next'
import { MdChevronLeft } from 'react-icons/md'
import { useRouter } from 'next/router'
import { AdminUserConfigLayout } from '@components/Layouts/AdminUserConfig'

const SettingsPage: NextLayoutComponentType = () => {
  const { push } = useRouter()
  return (
    <div>
      <button onClick={() => push('/admin/accounts')} className="flex items-center mb-3 space-x-2">
        <MdChevronLeft size={16} />
        <span>Back to Account List</span>
      </button>

      <Wrapper title="Meta Ads Config">
        <FbAdsConfigForm />
      </Wrapper>
    </div>
  )
}

SettingsPage.getLayout = function getLayout(page) {
  return <AdminUserConfigLayout children={page} />
}

export default SettingsPage
