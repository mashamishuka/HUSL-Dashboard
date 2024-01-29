import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import React, { useMemo } from 'react'
import { Doughnut } from 'react-chartjs-2'

import useSWR from 'swr'
import { GET_CHURNED_REVENUE_REPORT } from '@src/restapi/finances/constants'
import { ChurnRate } from '@src/restapi/finances'

ChartJS.register(ArcElement, Tooltip, Legend, {
  id: 'text',
  beforeDraw: function (chart) {
    if (!chart?.canvas?.dataset?.centerLabel) {
      return
    }
    const width = chart.width,
      height = chart.height,
      ctx = chart.ctx

    ctx.restore()
    const fontSize = (height / 212).toFixed(2)
    ctx.font = fontSize + 'rem Sofia Pro'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#BA954F'

    const text = chart?.data?.datasets?.[0]?.data?.[0]?.toString() || '0',
      textX = Math.round((width - ctx.measureText(text).width) / 2) - 6,
      textY = height / 2 + 2

    ctx.fillText(text + '%', textX, textY)
    ctx.save()
  }
})
// const totalData = faker.datatype.number(100)
export const chartData = {
  id: 'a',
  datasets: [
    {
      label: '# of Votes',
      data: [3, 1],
      backgroundColor: ['#BA954F', 'rgba(0,0,0,0)'],
      borderColor: ['rgba(0,0,0,0)', 'rgba(0,0,0,0)'],
      borderRadius: [100, 0]
    }
  ]
}

export const fakeData = {
  datasets: [
    {
      data: [100],
      backgroundColor: ['#3C3C3C'],
      borderColor: ['rgba(0,0,0,0)']
    }
  ]
}

export const ChurnRateCompactChart: React.FC = () => {
  const { data } = useSWR<RestApi.Response<ChurnRate>>(GET_CHURNED_REVENUE_REPORT)

  const chart = useMemo(() => {
    if (!data) return null
    return {
      label: ['Churn Rate', ''],
      datasets: [
        {
          label: 'Churn Rate',
          data: [data.data?.churnRate, data?.data?.churnedSubscriptions - data.data?.churnRate],
          backgroundColor: ['#BA954F', 'rgba(0,0,0,0)'],
          borderColor: ['rgba(0,0,0,0)', 'rgba(0,0,0,0)'],
          borderRadius: [100, 0]
        }
      ]
    }
  }, [data])

  if (!chart) {
    return (
      <div className="relative w-full lg:px-12">
        <div className="filter blur-lg">
          <Doughnut
            id="FAKE_DATA"
            data={fakeData}
            options={{
              animation: false,
              plugins: {
                tooltip: {
                  enabled: false
                }
              }
            }}
          />
          <Doughnut data={chartData} data-center-label="true" className="absolute top-0 left-0" />
        </div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="text-2xl">No data yet.</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full lg:px-12">
      <div className="relative">
        <Doughnut
          id="FAKE_DATA"
          data={fakeData}
          options={{
            animation: false,
            plugins: {
              tooltip: {
                enabled: false
              }
            }
          }}
        />
        <Doughnut data={chart} data-center-label="true" className="absolute top-0 left-0" />
      </div>
    </div>
  )
}
