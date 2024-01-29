// prettier-ignore
import {
  CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip
} from 'chart.js'
import React, { useMemo } from 'react'
import { Line } from 'react-chartjs-2'

import useSWR from 'swr'
import { Revenue } from '@src/restapi/finances'
import { transformCents } from '@utils/index'
import moment from 'moment'
import { transformDollars } from '@utils/lib/transformCents'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export const options: Record<string, any> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      // position: 'bottom',
      // align: 'start'
      display: false
    },
    title: {
      display: false
    }
  },
  elements: {
    line: {
      tension: 0.1
    }
  },
  scales: {
    x: {
      ticks: {
        color: 'white'
      }
    },
    y: {
      display: false
    }
  }
}

interface RevenueChartProps {
  reportType?: 'this_year' | 'this_month' | 'this_week' | 'last_year'
}
// const periodeType = {
//   this_year: 'This Year',
//   this_month: 'This Month',
//   this_week: 'This Week'
// }
export const RevenueChart: React.FC<RevenueChartProps> = ({ reportType = 'this_week' }) => {
  const { data } = useSWR<RestApi.Response<Revenue>>(`/finances/stripe/revenue?reportType=${reportType}`)

  const allTransactions = useMemo(() => {
    if (!data?.data?.allTransactions) return null
    const allTransactionsChart = data.data.allTransactions?.data?.map((trx) => {
      return transformCents(trx.total, true)
    })
    return {
      ...data.data?.allTransactions,
      chart: allTransactionsChart
    }
  }, [data?.data?.allTransactions])

  const transactions = useMemo(() => {
    if (!data?.data?.stats) return null
    const transactionsChart = data.data.stats?.data?.map((trx) => {
      return transformCents(trx.amount, true)
    })
    const alltimeTransactionsChart = data.data.alltimeStats?.data?.map((trx) => {
      return transformCents(trx.amount, true)
    })
    const totalRevenueFromTimePeriod = data.data.stats?.data?.reduce((acc, trx) => {
      return acc + trx.amount
    }, 0)
    return {
      ...data.data?.transactions,
      label: data?.data?.stats?.label,
      chart: transactionsChart,
      alltimeLabel: data?.data?.alltimeStats?.label,
      alltimeChart: alltimeTransactionsChart,
      totalRevenueFromTimePeriod
    }
  }, [data?.data?.transactions])

  const chartData = useMemo(() => {
    return {
      labels: transactions?.label,
      datasets: [
        {
          label: 'All Time',
          fill: true,
          data: transactions?.alltimeChart,
          borderWidth: 1,
          borderColor: '#BA954F',
          backgroundColor: '#BA954F',
          pointBackgroundColor: '#BA954F',
          pointRadius: 0,
          pointHoverRadius: 10,
          pointHitRadius: 100
        },
        {
          fill: true,
          data: transactions?.chart,
          borderWidth: 1,
          borderColor: '#fff',
          backgroundColor: '#fff',
          pointBackgroundColor: '#fff',
          pointRadius: 0,
          pointHoverRadius: 10,
          pointHitRadius: 100
        }
      ]
    }
  }, [allTransactions?.chart, transactions?.chart])
  return (
    <div>
      <div className="flex flex-col mt-8 space-x-0 space-y-3 xl:space-x-24 lg:space-x-14 md:flex-row md:space-y-0">
        <div className="flex flex-col space-y-2">
          <span className="text-[#7C7C7C]">Gross Revenue</span>
          <h1 className="text-3xl text-primary">
            {transactions?.totalRevenueFromTimePeriod !== undefined
              ? transformDollars(Math.round(transactions?.totalRevenueFromTimePeriod / 100))
              : 'Loading...'}
          </h1>
          <span className="font-light text-[#7C7C7C]">
            {allTransactions?.lastTransactionAt
              ? moment(allTransactions?.lastTransactionAt).format('DD MMM YYYY h:mm a')
              : 'No transactions yet.'}
          </span>
        </div>
        <div className="flex flex-col space-y-2">
          <span className="text-[#7C7C7C]">Today</span>
          <h1 className="text-3xl">{transformCents(data?.data?.todayTransactions?.amount)}</h1>
          <span className="font-light text-[#7C7C7C]">
            {data?.data?.todayTransactions?.lastTransactionAt
              ? moment(data?.data?.todayTransactions?.lastTransactionAt).format('DD MMM YYYY h:mm a')
              : 'No transactions yet.'}
          </span>
        </div>
      </div>
      <div>
        <Line height={175} options={options} data={chartData} />
      </div>
    </div>
  )
}
