import { Wrapper } from '@components/Layouts/Wrapper'

import type { NextLayoutComponentType } from 'next'
import { MdChevronLeft } from 'react-icons/md'
import { useRouter } from 'next/router'
import { AdminLayout } from '@components/Layouts/AdminLayout'
import { MasterFbAdsConfigForm } from '@components/Forms/admin/MasterFbAdsConfig'

const FBAdsSettingsPage: NextLayoutComponentType = () => {
  const { push } = useRouter()

  return (
    <div>
      <button onClick={() => push('/admin/accounts')} className="flex items-center mb-3 space-x-2">
        <MdChevronLeft size={16} />
        <span>Back to Account List</span>
      </button>
      <Wrapper title="Fb Ads Config" className="flex flex-col space-y-5">
        <MasterFbAdsConfigForm />
      </Wrapper>
    </div>
  )
}

FBAdsSettingsPage.getLayout = function getLayout(page) {
  return <AdminLayout children={page} />
}

export default FBAdsSettingsPage
