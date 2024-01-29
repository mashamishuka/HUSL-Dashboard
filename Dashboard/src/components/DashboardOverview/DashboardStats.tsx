import { GrossRevenue } from './GrossRevenue'
import { TotalRecurringRevenue } from './TotalRecurringRevenue'
import { ActiveCustomers } from './ActiveCustomers'
import { useGetFlatrates, useThisWeekSubscriptions } from '@hooks/usePurchases'
import { useMemo } from 'react'
import { Loading } from '@components/Icons'
import { GET_CLIENT_COUNT } from '@src/restapi/users/constants'
import useSWR from 'swr'
import { GET_HIGHEST_LEADERBOARD_REVENUE } from '@src/restapi/leaderboard/constants'
import { toCurrency } from '@utils/index'

const getOrderCount = (orders: any) => {
  // reduce and sum orders by customers
  const orderCount = orders?.reduce((acc: any, curr: any) => {
    if (curr?.customers) {
      return acc + (curr.customers || curr?.data?.quantity)
    }
    return acc
  }, 0)
  return orderCount
}
export const DashboardStats: React.FC = () => {
  const { data: weeklySubscribers, isLoading: weeklySubscribersLoading } = useThisWeekSubscriptions()
  const { data: delivered, isLoading: deliveredLoading } = useSWR(GET_CLIENT_COUNT)
  const { data: revenue, isLoading: revenueLoading } = useSWR(GET_HIGHEST_LEADERBOARD_REVENUE)
  const { data: flatrates, isLoading: isFlatratesLoading } = useGetFlatrates()

  const weeklySubscribedUsers: number | undefined = useMemo(() => {
    return weeklySubscribers?.data
  }, [weeklySubscribers])
  return (
    <div>
      <h1 className="text-lg font-semibold">Dashboard Stats</h1>
      <div className="grid mt-5 lg:grid-cols-3 gap-x-5">
        <GrossRevenue />
        <ActiveCustomers />
        <TotalRecurringRevenue />
      </div>
      <div className="grid mt-5 lg:grid-cols-4 gap-x-5">
        <div className="flex flex-col p-5 space-y-3 rounded-2xl bg-secondary">
          <h2 className="text-lg font-semibold">Total orders</h2>
          {!isFlatratesLoading ? <p className="text-3xl font-semibold">{getOrderCount(flatrates?.data)}</p> : <Loading />}
        </div>
        <div className="flex flex-col p-5 space-y-3 rounded-2xl bg-secondary">
          <h2 className="text-lg font-semibold">Total Delivered</h2>
          {!deliveredLoading ? <p className="text-3xl font-semibold">{delivered?.data || 0}</p> : <Loading />}
        </div>
        <div className="flex flex-col p-5 space-y-3 rounded-2xl bg-secondary">
          <h2 className="text-lg font-semibold">Highest Grossing Business</h2>
          {!revenueLoading ? (
            <p className="flex items-center space-x-1 text-3xl font-semibold">
              <span>
                {toCurrency(revenue?.data?.revenue ? Math.round(revenue?.data?.revenue / 100) : 0).replace('.00', '')}
              </span>
              <span className="text-sm font-normal">({revenue?.data?.user?.name})</span>
            </p>
          ) : (
            <Loading />
          )}
        </div>
        <div className="flex flex-col p-5 space-y-3 rounded-2xl bg-secondary">
          <h2 className="text-lg font-semibold">Weekly Sales</h2>
          {!weeklySubscribersLoading ? <p className="text-3xl font-semibold">{weeklySubscribedUsers}</p> : <Loading />}
        </div>
      </div>
    </div>
  )
}
