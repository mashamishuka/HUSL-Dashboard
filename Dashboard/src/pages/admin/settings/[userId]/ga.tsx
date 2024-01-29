import { Wrapper } from '@components/Layouts/Wrapper'
import { GAConfigForm } from '@components/Forms/admin/GAConfig'

import type { NextLayoutComponentType } from 'next'
import { AdminUserConfigLayout } from '@components/Layouts/AdminUserConfig'
import { MdChevronLeft } from 'react-icons/md'
import { useRouter } from 'next/router'

const GASettingsPage: NextLayoutComponentType = () => {
  const { push } = useRouter()

  return (
    <div>
      <button onClick={() => push('/admin/accounts')} className="flex items-center mb-3 space-x-2">
        <MdChevronLeft size={16} />
        <span>Back to Account List</span>
      </button>
      <Wrapper title="Google Analytics Config" className="flex flex-col space-y-5">
        <GAConfigForm />
      </Wrapper>
    </div>
  )
}

GASettingsPage.getLayout = function getLayout(page) {
  return <AdminUserConfigLayout children={page} />
}

export default GASettingsPage
