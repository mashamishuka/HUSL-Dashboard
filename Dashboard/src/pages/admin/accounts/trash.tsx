import { Wrapper } from '@components/Layouts/Wrapper'

import type { NextLayoutComponentType } from 'next'
import { AdminLayout } from '@components/Layouts/AdminLayout'
import { DeletedAccountListTable } from '@components/DataTables/DeletedAccountList'
import { useRouter } from 'next/router'

const AdminAccountPage: NextLayoutComponentType = () => {
  const { push } = useRouter()

  return (
    <div className="flex flex-col space-y-5">
      <Wrapper
        title="Trashed Accounts List"
        actionEl={
          <div className="relative">
            <button
              onClick={() => push('/admin/accounts')}
              className="flex items-center px-3 py-2 space-x-2 text-sm border rounded-lg border-primary text-primary">
              Active User List
            </button>
          </div>
        }>
        <div className="max-w-full py-5 -mt-4 overflow-x-auto md:py-0 md:mt-0">
          <DeletedAccountListTable />
        </div>
      </Wrapper>
    </div>
  )
}

AdminAccountPage.getLayout = function getLayout(page) {
  return <AdminLayout children={page} />
}

export default AdminAccountPage
