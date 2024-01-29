import { GET_RECURRING_REVENUE } from '@src/restapi/finances/constants'
import Image from 'next/image'
import useSWR from 'swr'
import { Loading } from '@components/Icons'
import { toCurrency } from '@utils/index'
import { CompactSelection } from '@components/Forms/components/Selects/CompactSelection'
import { useState } from 'react'
import moment from 'moment'
import QueryString from 'qs'

const filters = [
  { label: 'All Time', value: 'all-time' },
  { label: 'YTD', value: 'ytd' }
]
const unix_min = moment().startOf('year').unix()
const unix_max = moment().unix()

export const TotalRecurringRevenue: React.FC = () => {
  const [activeFilters, setActiveFilters] = useState(filters[0])
  const [params, setParams] = useState<Record<string, any>>()

  const { data, isLoading } = useSWR(GET_RECURRING_REVENUE + (params ? `?${QueryString.stringify(params)}` : ''))

  const handleChangeFilters = (selectedOptions: any) => {
    setActiveFilters(selectedOptions)
    if (selectedOptions?.value === 'ytd') {
      setParams({ ...params, unix_min, unix_max })
    } else {
      setParams(undefined)
    }
  }

  return (
    <div className="flex items-center justify-between p-5 rounded-2xl bg-secondary">
      <div className="flex flex-col space-y-3">
        <h2 className="text-lg font-semibold">Total Recurring Revenue</h2>
        <div className="flex items-center space-x-3">
          {!isLoading ? (
            <p className="text-3xl font-semibold">
              {toCurrency(data?.data ? Math.round(data?.data?.recurringRevenue / 100) : 0).replace('.00', '')}
            </p>
          ) : (
            <Loading />
          )}
          <CompactSelection
            items={filters}
            isMulti={false}
            isClearable={false}
            isSearchable={false}
            defaultValue={activeFilters}
            className="min-w-[5rem]"
            name="filters"
            onChange={handleChangeFilters}
          />
        </div>
      </div>
      <Image src="/static/icons/cash.png" width={64} height={64} className="object-contain opacity-30" />
    </div>
  )
}
