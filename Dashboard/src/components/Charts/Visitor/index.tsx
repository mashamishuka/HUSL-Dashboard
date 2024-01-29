// prettier-ignore
import {
  CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip
} from 'chart.js'
import moment from 'moment'
import React, { useMemo } from 'react'
import { Line } from 'react-chartjs-2'

import { faker } from '@faker-js/faker'
import { months } from '@utils/lib/months'
import useSWR from 'swr'
import { GET_GA_PAGE_VIEWS, GET_GA_SETTINGS } from '@src/restapi/ganalytics/constants'
// import { toast } from 'react-toastify'
import { nFormatter } from '@utils/index'
import api from '@services/api'
import QueryString from 'qs'
import { Setting } from '@src/restapi/setting/setting'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export const options: Record<string, any> = {
  responsive: true,
  maintainAspectRatio: false,
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
      tension: 0.5
    }
  },
  scales: {
    x: {
      ticks: {
        color: 'white'
      }
    },
    y: {
      suggestedMax: 100,
      grid: {
        color: 'transparent',
        borderColor: 'transparent'
      },
      ticks: {
        color: 'white',
        stepSize: 1000,
        callback: (value: number) => {
          return nFormatter(value)
        }
      }
    }
  }
}

const monthStart = moment()
const last7Months = moment().subtract(7, 'months')
const monthsCount = Math.ceil(moment.duration(monthStart.diff(last7Months)).asMonths())

const labels = [...Array(monthsCount)].map((_, i) => months[i + last7Months.month() + 2])

export const chartData = {
  labels,
  datasets: [
    {
      fill: true,
      data: labels.map(() => faker.datatype.number({ min: 0, max: 75 })),
      borderColor: '#BA954F',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      pointBackgroundColor: '#BA954F',
      pointRadius: 0,
      pointHoverRadius: 10,
      pointHitRadius: 100
    }
  ]
}

export const VisitorsChart = () => {
  const { data: config, error: configError } = useSWR<RestApi.Response<Setting>>(GET_GA_SETTINGS)

  const ga_refresh_token = config?.data?.value?.refresh_token || api.defaults.headers.common?.ga_refresh_token
  const param = QueryString.stringify(
    {
      token: ga_refresh_token
    },
    { skipNulls: true }
  )
  const fetchKey = !config && !configError ? null : `${GET_GA_PAGE_VIEWS}?${param}`
  const { data, error } = useSWR<RestApi.Response<GAnalyticPageView[]>>(fetchKey)

  const pageViewReport = useMemo(() => {
    if (!data) return null

    const dataset = data?.data?.map((item) => item.pageViews)
    const labels = data?.data?.map((item) => item?.monthShort)
    return {
      labels,
      dataset
    }
  }, [data?.data])

  const chart = useMemo(() => {
    if (!pageViewReport) return null
    return {
      labels: pageViewReport.labels,
      datasets: [
        {
          label: 'Page Views',
          data: pageViewReport.dataset,
          borderColor: '#BA954F',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          pointBackgroundColor: '#BA954F',
          pointRadius: 0,
          pointHoverRadius: 10,
          pointHitRadius: 100
        }
      ]
    }
  }, [pageViewReport])

  // useEffect(() => {
  //   if (error) {
  //     toast.error(`There was an error while fetching GA data. Your token may expired.`, {
  //       toastId: 'ga-page-views-error'
  //     })
  //   }
  //   return () => {
  //     toast.dismiss('ga-page-views-error')
  //   }
  // }, [error])

  if (!chart) {
    return (
      <div className="relative">
        <div className="filter blur-lg">
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
