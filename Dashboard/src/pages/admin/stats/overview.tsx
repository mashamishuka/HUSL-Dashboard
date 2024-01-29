import { AdminLayout } from '@components/Layouts/AdminLayout'
import { NextLayoutComponentType } from 'next'
import { DashboardStats } from '@components/DashboardOverview/DashboardStats'

const StatsOverviewPage: NextLayoutComponentType = () => {
  return (
    <div className="flex flex-col space-y-8">
      <DashboardStats />
    </div>
  )
}

StatsOverviewPage.getLayout = function getLayout(page) {
  return <AdminLayout children={page} />
}

export default StatsOverviewPage
