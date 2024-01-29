import { GET_RECURRING_REVENUE } from '@src/restapi/finances/constants'
import Image from 'next/image'
import useSWR from 'swr'
import { Loading } from '@components/Icons'

export const ActiveCustomers: React.FC = () => {
  const { data, isLoading } = useSWR(GET_RECURRING_REVENUE)

  return (
    <div className="flex items-center justify-between p-5 rounded-2xl bg-secondary">
      <div className="flex flex-col space-y-3">
        <h2 className="text-lg font-semibold">Active Customers</h2>
        {!isLoading ? <p className="text-3xl font-semibold">{data?.data?.customers || 0}</p> : <Loading />}
      </div>
      <Image src="/static/icons/customers.png" width={64} height={64} className="object-contain opacity-30" />
    </div>
  )
}
