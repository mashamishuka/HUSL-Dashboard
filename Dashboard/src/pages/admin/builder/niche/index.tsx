import { useRouter } from 'next/router'
import { MdChevronLeft } from 'react-icons/md'
import { AdminLayout } from '@components/Layouts/AdminLayout'
import { NicheListTable } from '@components/DataTables/NicheList'
import type { NextLayoutComponentType } from 'next'

const NicheListPage: NextLayoutComponentType = () => {
  const { push } = useRouter()
  return (
    <div>
      <button onClick={() => push('/admin/accounts')} className="flex items-center mb-3 space-x-2">
        <MdChevronLeft size={16} />
        <span>Back to Account List</span>
      </button>

      <NicheListTable />
    </div>
  )
}

NicheListPage.getLayout = function getLayout(page) {
  return <AdminLayout children={page} />
}

export default NicheListPage
