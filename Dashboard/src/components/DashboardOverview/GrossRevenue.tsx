import { Loading } from '@components/Icons'
import { GET_LEADERBOARD_REVENUE } from '@src/restapi/leaderboard/constants'
import { toCurrency } from '@utils/index'
import Image from 'next/image'
import useSWR from 'swr'

export const GrossRevenue: React.FC = () => {
  const { data, isLoading } = useSWR(GET_LEADERBOARD_REVENUE)
  return (
    <div className="flex items-center justify-between p-5 rounded-2xl bg-secondary">
      <div className="flex flex-col space-y-3">
        <h2 className="text-lg font-semibold">Gross Generated</h2>
        {!isLoading ? (
          <p className="text-3xl font-semibold">
            {toCurrency(data?.data ? Math.round(data?.data / 100) : 0).replace('.00', '')}
          </p>
        ) : (
          <Loading />
        )}
      </div>
      <Image src="/static/icons/money-bag.png" width={64} height={64} className="object-contain opacity-30" />
    </div>
  )
}
