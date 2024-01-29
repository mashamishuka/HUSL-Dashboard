import { Wrapper } from '@components/Layouts/Wrapper'
import { EditUserForm } from '@components/Forms/admin/EditUser'

import type { NextLayoutComponentType } from 'next'
import { AdminUserConfigLayout } from '@components/Layouts/AdminUserConfig'
import { useRouter } from 'next/router'
import { MdChevronLeft } from 'react-icons/md'

const AdminProfileSettingsPage: NextLayoutComponentType = () => {
  const { push } = useRouter()

  return (
    <div>
      <button onClick={() => push('/admin/accounts')} className="flex items-center mb-3 space-x-2">
        <MdChevronLeft size={16} />
        <span>Back to Account List</span>
      </button>
      <Wrapper title="Manage Profile" className="flex flex-col space-y-5">
        <EditUserForm />
      </Wrapper>
    </div>
  )
}

AdminProfileSettingsPage.getLayout = function getLayout(page) {
  return <AdminUserConfigLayout children={page} />
}

export default AdminProfileSettingsPage
