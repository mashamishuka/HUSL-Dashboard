import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import React from 'react'
import { Doughnut } from 'react-chartjs-2'

import { faker } from '@faker-js/faker'

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
const totalData = faker.datatype.number(100)
export const data = {
  id: 'a',
  datasets: [
    {
      label: '# of Votes',
      data: [totalData, 100 - totalData],
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

export const GoogleAnalyticsChart: React.FC = () => {
  return (
    <div className="relative">
      <Doughnut
        id="FAKE_DATA"
        data={fakeData}
        options={{
          animation: false
        }}
      />
      <Doughnut data={data} data-center-label="true" className="absolute top-0 right-0" />
    </div>
  )
}
