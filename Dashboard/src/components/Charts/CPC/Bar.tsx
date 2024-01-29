// prettier-ignore
import {
    BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip
} from 'chart.js'
import React, { useEffect, useMemo } from 'react'
import { Bar } from 'react-chartjs-2'

import { faker } from '@faker-js/faker'
import { monthsSimple } from '@utils/lib/months'
import useSWR from 'swr'
import { FbAdsCPC } from '@src/restapi/fbads/fbads'
import { GET_FBADS_CPC } from '@src/restapi/fbads/constants'
import { toast } from 'react-toastify'

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
        display: false
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

const labels = monthsSimple

export const chartData = {
  labels,
  datasets: [
    {
      label: 'CPC',
      data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
      backgroundColor: '#BA954F'
    }
  ]
}

interface CPCBarChartProps {
  periodType?: 'yearly' | 'monthly' | 'weekly'
}
export const CPCBarChart: React.FC<CPCBarChartProps> = ({ periodType = 'yearly' }) => {
  const { data, error } = useSWR<RestApi.Response<FbAdsCPC>>(`${GET_FBADS_CPC}?periodType=${periodType}`)

  const cpcReport = useMemo(() => {
    if (!data) return null

    const dataset = data?.data?.cpc?.map((item) => item.cpc)
    const labels = data?.data?.cpc?.map((item) => {
      if (periodType === 'yearly') return item?.monthShort
      if (periodType === 'monthly') return item?.date
      return item?.dayShort
    })
    return {
      labels,
      dataset
    }
  }, [data?.data])

  const chart = useMemo(() => {
    if (!cpcReport) return null
    return {
      labels: cpcReport.labels,
      datasets: [
        {
          label: 'Growth',
          data: cpcReport.dataset,
          backgroundColor: '#BA954F'
        }
      ]
    }
  }, [cpcReport])

  useEffect(() => {
    if (error) {
      toast.error(`There was an error while fetching fb ads data. Your token may expired.`, {
        toastId: 'fbads'
      })
    }
  }, [error])

  if (!chart) {
    return (
      <div className="relative">
        <div className="filter blur-lg">
          <span className="font-light text-sm text-[#7C7C7C] block -mt-7 mb-7">July 2022 until August 2022</span>
          <Bar options={options} data={chartData} />
        </div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="text-2xl">{!data && !error ? 'Loading...' : 'No data yet.'}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <span className="font-light text-sm text-[#7C7C7C] block -mt-7 mb-7">
        {data?.data?.timeRange?.start} until {data?.data?.timeRange?.end}
      </span>
      <Bar options={options} data={chart} />
    </div>
  )
}
