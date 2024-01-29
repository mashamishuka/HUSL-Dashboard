import { AdminLayout } from '@components/Layouts/AdminLayout'
import { NextLayoutComponentType } from 'next'
import { AccountListTable } from '@components/DataTables/AccountList'
import { DashboardOverview } from '@components/DashboardOverview'

const DashboardPage: NextLayoutComponentType = () => {
  return (
    <div className="flex flex-col space-y-8">
      <DashboardOverview />
      <AccountListTable />
    </div>
  )
}

DashboardPage.getLayout = function getLayout(page) {
  return <AdminLayout children={page} />
}

export default DashboardPage
