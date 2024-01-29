import { GrossRevenue } from './GrossRevenue'
import { TotalRecurringRevenue } from './TotalRecurringRevenue'
import { ActiveCustomers } from './ActiveCustomers'
import Link from 'next/link'
import { MdChevronRight } from 'react-icons/md'

export const DashboardOverview: React.FC = () => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Dashboard Overview</h1>
        <Link href="/admin/stats/overview">
          <a className="flex items-center space-x-2">
            <span>See More</span>
            <MdChevronRight />
          </a>
        </Link>
      </div>
      <div className="grid mt-5 lg:grid-cols-3 gap-x-5">
        <GrossRevenue />
        <ActiveCustomers />
        <TotalRecurringRevenue />
      </div>
    </div>
  )
}
