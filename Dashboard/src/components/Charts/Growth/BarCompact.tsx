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
import { GET_MONTHLY_GROWTH_REPORT } from '@src/restapi/finances/constants'
import { GrowthReport } from '@src/restapi/finances'
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
        // Include a dollar sign in the ticks
        callback: function (value: string) {
          return '$' + value
        },
        beginAtZero: false
      }
    }
  }
}

const monthStart = moment()
const last7Months = moment().subtract(7, 'months')
const monthsCount = Math.ceil(moment.duration(monthStart.diff(last7Months)).asMonths())

const labels = [...Array(monthsCount)].map((_, i) => monthsSimple[i + last7Months.month() + 2])

const chartData = {
  labels,
  datasets: [
    {
      label: 'Growth',
      data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
      backgroundColor: '#BA954F'
    }
  ]
}

export const GrowthBarCompact = () => {
  const { data } = useSWR<RestApi.Response<GrowthReport>>(GET_MONTHLY_GROWTH_REPORT)

  const growthReport = useMemo(() => {
    if (!data) return null
    let month = moment().month()

    if (month >= 4) {
      month = 5
    }

    const last7MonthsData = data.data.data?.slice(month, 6 + month)
    const dataset = last7MonthsData?.map((item) => transformCents(item.amount, true))
    const labels = last7MonthsData?.map((item) => item.monthShort)
    return {
      labels,
      dataset
    }
  }, [data?.data])

  const chart = useMemo(() => {
    if (!growthReport) return null
    return {
      labels: growthReport.labels,
      datasets: [
        {
          label: 'Growth',
          data: growthReport.dataset,
          backgroundColor: '#BA954F'
        }
      ]
    }
  }, [growthReport])

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
