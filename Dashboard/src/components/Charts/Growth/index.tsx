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
import { StripeCustomerGrowth } from '@src/restapi/finances'
import { GET_STRIPE_CUSTOMER_GROWTH } from '@src/restapi/finances/constants'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const getOrCreateLegendList = (_: any, id: any) => {
  const legendContainer = document.getElementById(id)
  let listContainer = legendContainer?.querySelector('ul')

  if (!listContainer) {
    listContainer = document.createElement('ul')
    listContainer.style.color = '#fff'
    listContainer.style.display = 'flex'
    listContainer.style.flexDirection = 'row'
    // listContainer.classList.add('space-x-20')
    listContainer.style.margin = '0'
    listContainer.style.padding = '0'

    legendContainer?.appendChild(listContainer)
  }

  return listContainer
}

const htmlLegendPlugin = {
  id: 'htmlLegend',
  afterUpdate(chart: any, _: any, options: any) {
    const ul = getOrCreateLegendList(chart, options.containerID)

    // Remove old legend items
    while (ul.firstChild) {
      ul.firstChild.remove()
    }

    // Reuse the built-in legendItems generator
    const items = chart.options.plugins.legend.labels.generateLabels(chart)

    items.forEach((item: any, i: number) => {
      const li = document.createElement('li')
      const data = chart?.data?.datasets?.[i]?.data
      const totalData = data?.reduce((a: number, b: number) => a + b, 0)
      if (i > 0) {
        li.style.marginLeft = '5rem'
      } else {
        li.style.marginLeft = '10px'
      }
      li.style.color = '#fff'
      li.style.alignItems = 'baseline'
      li.style.cursor = 'pointer'
      li.style.display = 'flex'
      li.style.flexDirection = 'row'

      li.onclick = () => {
        const { type } = chart.config
        if (type === 'pie' || type === 'doughnut') {
          // Pie and doughnut charts only have a single dataset and visibility is per item
          chart.toggleDataVisibility(item.index)
        } else {
          chart.setDatasetVisibility(item.datasetIndex, !chart.isDatasetVisible(item.datasetIndex))
        }
        chart.update()
      }

      // Color box
      const boxSpan = document.createElement('span')
      boxSpan.style.background = item.fillStyle
      boxSpan.style.borderRadius = '50%'
      boxSpan.style.display = 'inline-block'
      boxSpan.style.height = '10px'
      boxSpan.style.marginRight = '10px'
      boxSpan.style.width = '10px'

      // Text
      const textContainer = document.createElement('span')
      textContainer.style.color = '#fff'
      textContainer.style.margin = '0'
      textContainer.style.padding = '0'
      textContainer.style.textDecoration = item.hidden ? 'line-through' : ''

      // Value
      const value = document.createElement('p')
      value.style.color = '#fff'
      value.style.marginTop = '16px'
      value.style.padding = '0'
      value.style.fontSize = '20px'
      value.style.textDecoration = item.hidden ? 'line-through' : ''
      const textValue = document.createTextNode(
        // totalData?.toLocaleString('en-US', {
        //   style: 'currency',
        //   currency: 'USD'
        // })
        totalData
      )
      value.appendChild(textValue)

      const text = document.createTextNode(item.text)
      textContainer.appendChild(text)

      li.appendChild(boxSpan)
      li.appendChild(textContainer)
      textContainer.appendChild(value)
      ul.appendChild(li)
    })
  }
}

export const options: Record<string, any> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    htmlLegend: {
      // ID of the container to put the legend in
      containerID: 'legend-container'
    },
    legend: {
      // position: 'bottom',
      // align: 'start'
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
      grid: {
        color: 'transparent',
        borderColor: 'transparent'
      },
      ticks: {
        color: 'white',
        stepSize: 1
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
      label: 'This Year',
      fill: true,
      data: labels.map(() => faker.datatype.number({ min: 0, max: 75 })),
      borderColor: '#BA954F',
      backgroundColor: '#BA954F',
      pointBackgroundColor: '#BA954F',
      pointRadius: 0,
      pointHoverRadius: 10,
      pointHitRadius: 100
    },
    {
      label: 'Past Year',
      fill: true,
      data: labels.map(() => faker.datatype.number({ min: 0, max: 75 })),
      borderColor: '#fff',
      backgroundColor: '#fff',
      pointBackgroundColor: '#fff',
      pointRadius: 0,
      pointHoverRadius: 10,
      pointHitRadius: 100
    }
  ]
}

interface GrowthChartProps {
  compact?: boolean
}
export const GrowthChart: React.FC<GrowthChartProps> = ({ compact }) => {
  const { data, error } = useSWR<RestApi.Response<StripeCustomerGrowth>>(GET_STRIPE_CUSTOMER_GROWTH)

  const customerGrowth = useMemo(() => {
    if (!data) return null
    let month = moment().month()

    if (month > 4) {
      month = 6
    }
    if (compact) {
      const last7MonthsData = data.data.data?.slice(month, 6 + month)
      const dataset_1 = last7MonthsData?.map((item) => item.thisYear)
      const dataset_2 = last7MonthsData?.map((item) => item.lastYear)
      const labels = last7MonthsData?.map((item) => item.monthShort)
      return {
        labels,
        dataset_1,
        dataset_2
      }
    }
    const dataset_1 = data?.data?.data?.map((item) => item.thisYear) || []
    const dataset_2 = data?.data?.data?.map((item) => item.lastYear) || []

    const labels = data?.data?.data?.map((item) => {
      return item?.monthShort
    })
    return {
      labels,
      dataset_1,
      dataset_2
    }
  }, [data?.data])

  const chart = useMemo(() => {
    if (!customerGrowth) return null
    return {
      fill: true,
      labels: customerGrowth.labels,
      datasets: [
        {
          label: 'This Year',
          fill: true,
          data: customerGrowth.dataset_1,
          borderColor: '#BA954F',
          backgroundColor: '#BA954F',
          pointBackgroundColor: '#BA954F',
          pointRadius: 0,
          pointHoverRadius: 10,
          pointHitRadius: 100
        },
        {
          label: 'Past Year',
          fill: true,
          data: customerGrowth.dataset_2,
          borderColor: '#fff',
          backgroundColor: '#fff',
          pointBackgroundColor: '#fff',
          pointRadius: 0,
          pointHoverRadius: 10,
          pointHitRadius: 100
        }
      ]
    }
  }, [customerGrowth])

  if (!chart) {
    return (
      <div className="relative">
        <div className="filter blur-lg">
          <Line height={!compact ? 250 : 150} options={options} data={chartData} plugins={[htmlLegendPlugin]} />
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
    <>
      <div>
        <Line height={!compact ? 250 : 150} options={options} data={chart} plugins={[htmlLegendPlugin]} />
      </div>
      {!compact && <div id="legend-container" className="mt-10 text-xs font-light uppercase !text-white" />}
    </>
  )
}
