// prettier-ignore
import {
    BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip
} from 'chart.js'
import React, { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'

import { faker } from '@faker-js/faker'
import useSWR from 'swr'
import { StripeCPA } from '@src/restapi/finances'
import { GET_STRIPE_CPA } from '@src/restapi/finances/constants'

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
        callback: function (value: string) {
          return value?.toLocaleString()
        },
        beginAtZero: false,
        stepSize: 5
      }
    }
  }
}

const labels = ['Jan-Feb', 'Mar-Apr', 'May-Jun', 'Jul-Aug', 'Sep-Oct', 'Nov-Dec']

export const chartData = {
  labels,
  datasets: [
    {
      label: 'CPA',
      data: labels.map(() => faker.datatype.number({ min: 0, max: 250000 })),
      backgroundColor: '#BA954F',
      borderRadius: 12
    }
  ]
}

export const CPABarChart = () => {
  const { data, error } = useSWR<RestApi.Response<StripeCPA>>(`${GET_STRIPE_CPA}`)

  const cpaReport = useMemo(() => {
    if (!data) return null

    const dataset = data?.data?.data?.map((item) => item.cpa)
    const labels = data?.data?.data?.map((item) => {
      return item?.monthShort
    })
    return {
      labels,
      dataset
    }
  }, [data?.data])

  const chart = useMemo(() => {
    if (!cpaReport) return null
    return {
      labels: cpaReport.labels,
      datasets: [
        {
          label: 'Stripe CPA',
          data: cpaReport.dataset,
          backgroundColor: '#BA954F'
        }
      ]
    }
  }, [cpaReport])

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

  return <Bar options={options} data={chart} />
}
