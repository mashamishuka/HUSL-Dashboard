// prettier-ignore
import {
    CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip
} from 'chart.js'
import React from 'react'
import { Line } from 'react-chartjs-2'

import { faker } from '@faker-js/faker'
import { monthsSimple } from '@utils/lib/months'

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
          return '$' + value
        },
        stepSize: 100,
        beginAtZero: false
      }
    }
  }
}

const labels = monthsSimple

export const data = {
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

export const PixelTrackingChart = () => {
  return <Line options={options} data={data} />
}
