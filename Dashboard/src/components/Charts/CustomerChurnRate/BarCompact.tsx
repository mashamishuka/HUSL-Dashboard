// prettier-ignore
import {
    BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip
} from 'chart.js'
import moment from 'moment'
import React, { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'

import { faker } from '@faker-js/faker'
import { monthsSimple } from '@utils/lib/months'
import useSWR from 'swr'
import { GET_CHURNED_REVENUE_REPORT } from '@src/restapi/finances/constants'
import { ChurnRate } from '@src/restapi/finances'
import { transformCents } from '@utils/index'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export const options: Record<string, any> = {
  responsive: true,
  plugins: {
    legend: {
      display: false
    },
    title: {
      display: false
    }
  },
  scales: {
    y: {
      grid: {
        color: 'rgba(255,255,255,.5)',
        borderDash: [2]
      },
      ticks: {
        beginAtZero: false
      }
    }
  }
}

const monthStart = moment()
const last7Months = moment().subtract(7, 'months')
const monthsCount = Math.ceil(moment.duration(monthStart.diff(last7Months)).asMonths())

const labels = [...Array(monthsCount)].map((_, i) => monthsSimple[i + last7Months.month() + 2])

export const chartData = {
  labels,
  datasets: [
    {
      label: 'Churn Rate',
      data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
      backgroundColor: '#BA954F'
    }
  ]
}

export const CustomerChurnRateBarCompact = () => {
  const { data } = useSWR<RestApi.Response<ChurnRate>>(GET_CHURNED_REVENUE_REPORT)

  const churnRateReport = useMemo(() => {
    if (!data) return null
    let month = moment().month()
    if (month >= 4) {
      month = 6
    }

    const last7MonthsData = data.data.churnedRevenue?.slice(month, 6 + month)
    const dataset = last7MonthsData?.map((item) => transformCents(item.amount, true))
    const labels = last7MonthsData?.map((item) => item.monthShort)
    return {
      labels,
      dataset
    }
  }, [data?.data])

  const chart = useMemo(() => {
    if (!churnRateReport) return null
    return {
      labels: churnRateReport.labels,
      datasets: [
        {
          label: 'Churn Rate',
          data: churnRateReport.dataset,
          backgroundColor: '#BA954F'
        }
      ]
    }
  }, [churnRateReport])

  if (!chart) {
    return (
      <div className="relative">
        <div className="filter blur-lg">
          <Bar options={options} data={chartData} />
        </div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="text-2xl">No data yet.</div>
          </div>
        </div>
      </div>
    )
  }

  return <Bar options={options} data={chart} />
}
