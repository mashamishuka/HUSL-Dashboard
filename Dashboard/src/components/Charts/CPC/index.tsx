// prettier-ignore
import {
    CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip
} from 'chart.js'
import React, { useEffect, useMemo } from 'react'
import { Line } from 'react-chartjs-2'

import { faker } from '@faker-js/faker'
import { monthsSimple } from '@utils/lib/months'
import useSWR from 'swr'
import { GET_FBADS_CPC } from '@src/restapi/fbads/constants'
import { FbAdsCPC } from '@src/restapi/fbads/fbads'
import { toast } from 'react-toastify'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

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
  elements: {
    line: {
      tension: 0
    }
  },
  scales: {
    x: {
      suggestedMax: 300
    },
    y: {
      grid: {
        display: false
      },
      ticks: {
        callback: function (value: string) {
          return value
        },
        stepSize: 100,
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
      fill: true,
      label: 'Chart',
      data: [...Array(labels.length)].map(() => faker.datatype.number({ min: 0, max: 1000 })),
      borderColor: '#BA954F',
      backgroundColor: 'rgba(186, 149, 79, .1)',
      pointBackgroundColor: '#BA954F',
      pointRadius: 0,
      borderWidth: 1.5,
      pointHoverRadius: 5,
      pointHitRadius: 100
    }
  ]
}
interface CPCChartProps {
  height?: number
  periodType?: 'yearly' | 'monthly' | 'weekly'
}

export const CPCChart: React.FC<CPCChartProps> = ({ height, periodType = 'yearly' }) => {
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
          borderColor: '#BA954F',
          backgroundColor: 'rgba(186, 149, 79, .1)',
          pointBackgroundColor: '#BA954F',
          pointRadius: 0,
          borderWidth: 1.5,
          pointHoverRadius: 5,
          pointHitRadius: 100
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
          <Line options={options} data={chartData} height={height || 'auto'} />
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
      <Line options={options} data={chart} height={height || 'auto'} />
    </div>
  )
}
