// prettier-ignore
import {
    CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip
} from 'chart.js'
import React, { useMemo } from 'react'
import { Line } from 'react-chartjs-2'

import { faker } from '@faker-js/faker'
import { monthsSimple } from '@utils/lib/months'
import useSWR from 'swr'
import { StripeCustomer } from '@src/restapi/finances'
import { GET_MONTHLY_CUSTOMER_BY_TAG } from '@src/restapi/finances/constants'

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
        color: 'rgba(255,255,255,.5)',
        borderDash: [2]
      },
      ticks: {
        // Include a dollar sign in the ticks
        callback: function (value: string) {
          return value
        },
        stepSize: 1,
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
      label: 'Customer Growth',
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

export const CustomerChart = () => {
  const { data, error } = useSWR<RestApi.Response<StripeCustomer>>(GET_MONTHLY_CUSTOMER_BY_TAG)

  const customerReport = useMemo(() => {
    if (!data) return null

    const dataset = data?.data?.data?.map((item) => item.customers) || []
    const labels = data?.data?.data?.map((item) => {
      return item?.monthShort
    })
    return {
      labels,
      dataset
    }
  }, [data?.data])

  const chart = useMemo(() => {
    if (!customerReport) return null
    return {
      fill: true,
      labels: customerReport.labels,
      datasets: [
        {
          label: 'Customer Growth',
          data: customerReport.dataset,
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
  }, [customerReport])

  if (!chart) {
    return (
      <div className="relative">
        <div className="filter blur-lg">
          <span className="font-light text-sm text-[#7C7C7C] block -mt-7 mb-7">July 2022 until August 2022</span>
          <Line options={options} data={chartData} />
        </div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="text-2xl">{!data && !error ? 'Loading...' : 'No data yet.'}</div>
          </div>
        </div>
      </div>
    )
  }

  return <Line options={options} data={chart} />
}
