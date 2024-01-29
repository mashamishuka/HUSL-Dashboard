import api from '@services/api'
import { GET_GA_BROWSERS, GET_GA_SETTINGS } from '@src/restapi/ganalytics/constants'
import { Setting } from '@src/restapi/setting/setting'
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import clsx from 'clsx'
import QueryString from 'qs'
import React, { useMemo } from 'react'
import { Doughnut } from 'react-chartjs-2'
import useSWR from 'swr'

ChartJS.register(ArcElement, Tooltip, Legend, {
  id: 'text'
  // beforeDraw: function (chart) {
  //   if (!chart?.canvas?.dataset?.centerLabel) {
  //     return
  //   }
  //   const width = chart.width
  //   const height = chart.height
  //   const ctx = chart.ctx

  //   ctx.restore()
  //   const fontSize = (height / 212).toFixed(2)
  //   ctx.font = fontSize + 'rem Sofia Pro'
  //   ctx.textBaseline = 'middle'
  //   ctx.fillStyle = '#BA954F'

  //   const text = chart?.data?.datasets?.[0]?.data?.[0]?.toString() || '0'
  //   const textX = Math.round((width - ctx.measureText(text).width) / 2) - 6
  //   const textY = height / 2 + 2

  //   ctx.fillText(text + '%', textX, textY)
  //   ctx.save()
  // }
})

export const chartData = {
  id: 'a',
  datasets: [
    {
      label: '# of Votes',
      data: [15, 20, 15, 20, 25],
      backgroundColor: ['#BA954F', 'rgba(0,0,0,0)'],
      borderColor: ['rgba(0,0,0,0)', 'rgba(0,0,0,0)']
    }
  ]
}

export const fakeData = {
  labels: [],
  datasets: [
    {
      data: [100],
      backgroundColor: ['#3C3C3C'],
      borderColor: ['rgba(0,0,0,0)']
    }
  ]
}

export const SEODoughnutPercentageChart: React.FC = () => {
  const { data: config, error: configError } = useSWR<RestApi.Response<Setting>>(GET_GA_SETTINGS)

  const ga_refresh_token = config?.data?.value?.refresh_token || api.defaults.headers.common?.ga_refresh_token
  const param = QueryString.stringify(
    {
      token: ga_refresh_token
    },
    { skipNulls: true }
  )
  const fetchKey = !config && !configError ? null : `${GET_GA_BROWSERS}?${param}`
  const { data, error } = useSWR<RestApi.Response<GAnalyticDevice[]>>(fetchKey)

  const devicesReport = useMemo(() => {
    if (!data) return null

    const dataset = data?.data?.map((item) => item?.sessions)
    const labels = data?.data?.map((item) => item?.device)
    return {
      labels,
      dataset
    }
  }, [data?.data])

  const chart = useMemo(() => {
    if (!devicesReport) return null
    const bgs = devicesReport?.labels?.map(() => '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0'))
    return {
      labels: devicesReport.labels,
      datasets: [
        {
          label: 'Devices Report',
          data: devicesReport.dataset,
          backgroundColor: devicesReport.dataset?.map((_, i) => bgs[i]),
          borderColor: devicesReport.dataset?.map(() => 'rgba(0,0,0,0)')
        }
      ]
    }
  }, [devicesReport])

  if (!chart) {
    return (
      <div className={clsx('mx-auto', devicesReport && devicesReport?.labels?.length < 5 && 'w-7/12')}>
        <div className="relative">
          <div className="filter blur-lg">
            <div className="relative">
              <Doughnut
                id="FAKE_DATA"
                data={fakeData}
                options={{
                  animation: false
                }}
              />
              <Doughnut data={chartData} data-center-label="true" className="absolute top-0 right-0" />
            </div>
          </div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="flex flex-col items-center justify-center w-full h-full">
              <div className="text-2xl">{!data && !error ? 'Loading...' : 'No data yet.'}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className={clsx('relative mx-auto', devicesReport && devicesReport?.labels?.length < 5 && 'w-7/12')}>
      {/* <Doughnut
        id="FAKE_DATA"
        data={fakeData}
        options={{
          animation: false
        }}
      /> */}
      <Doughnut data={chart} data-center-label="true" />
    </div>
  )
}
