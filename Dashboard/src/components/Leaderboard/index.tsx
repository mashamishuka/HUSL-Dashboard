import { SingleSelect } from '@components/Forms/components'
import { GET_LEADERBOARD } from '@src/restapi/leaderboard/constants'
import { Leaderboard as LeaderboardInterface } from '@src/restapi/leaderboard/leaderboard'
import { toCurrency } from '@utils/index'
import clsx from 'clsx'
import { MdArrowUpward } from 'react-icons/md'
import useSWR from 'swr'
import { useState } from 'react'
import { callbackAvatar } from '@utils/lib/callbackAvatar'
import { Pagination } from '@components/Pagination'
import QueryString from 'qs'
import { Loading } from '@components/Icons'

export const Leaderboard: React.FC = () => {
  const [query, setQuery] = useState<Record<string, any>>({
    page: 1,
    limit: 20,
    sort: {
      revenue: -1
    }
  })
  const { data, error } = useSWR<RestApi.Response<LeaderboardInterface[]>>(
    GET_LEADERBOARD + '?' + QueryString.stringify(query)
  )
  const [filter, setFilter] = useState<'revenue' | 'influence' | 'leads'>('revenue')

  const handleFilter = (value: 'revenue' | 'influence' | 'leads') => {
    setFilter(value)
    switch (value) {
      case 'influence':
        setQuery({
          ...query,
          page: 1,
          sort: {
            influence: -1
          }
        })
        break
      case 'leads':
        setQuery({
          ...query,
          page: 1,
          sort: {
            leads: -1
          }
        })
        break
      default:
        setQuery({
          ...query,
          page: 1,
          sort: {
            revenue: -1
          }
        })
        break
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-xl">Leaderboard</h1>
        <SingleSelect
          className="w-40"
          items={[
            {
              label: 'Top Revenue',
              value: 'revenue'
            },
            {
              label: 'Top Influence',
              value: 'influence'
            },
            {
              label: 'Top Leads',
              value: 'leads'
            }
          ]}
          onChange={handleFilter}
          hideSearch
        />
      </div>
      {!data && !error ? (
        <div className="flex items-center justify-center mb-8 h-36">
          <Loading />
        </div>
      ) : (
        <div>
          <table className="w-full text-left table-fixed md:table-auto">
            <thead>
              <tr>
                <th className="hidden">Change</th>
                <th className="pr-0 w-14">Rank</th>
                <th className="w-56 pr-5 md:pr-0 md:w-auto">Company</th>
                <th className="w-36">Active Customers</th>
                <th className="w-28">Leads</th>
                <th className="w-auto">Revenue</th>
                <th className="w-28">Influence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {data?.data?.map((leaderboard, index) => (
                <tr key={index} className="[&>td]:py-3">
                  <td className="hidden">
                    <div>
                      {leaderboard?.changes?.[filter]?.type === 'up' && (
                        <span
                          className={clsx(
                            'flex items-center',
                            leaderboard?.changes?.[filter]?.value >= 3 || leaderboard?.changes?.[filter]?.value === 1
                              ? 'text-success'
                              : null
                          )}>
                          <MdArrowUpward />
                          <span className="ml-1">{leaderboard?.changes?.[filter]?.value}</span>
                        </span>
                      )}
                      {leaderboard?.changes?.[filter]?.type === 'down' && (
                        <span
                          className={clsx('flex items-center', leaderboard?.changes?.[filter]?.value >= 3 && 'text-danger')}>
                          <MdArrowUpward className="transform rotate-180" />
                          <span className="ml-1">{leaderboard?.changes?.[filter]?.value}</span>
                        </span>
                      )}
                      {leaderboard?.changes?.[filter]?.type === 'equal' && (
                        <span
                          className={clsx(
                            'flex items-center',
                            leaderboard?.changes?.[filter]?.value >= 3 && 'text-gray-500'
                          )}>
                          {/* <MdArrowUpward className="transform rotate-180" /> */}
                          <span className="ml-1">0</span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      className={clsx(
                        'w-7 h-7 justify-center rounded-full flex items-center',
                        (query?.page - 1) * query?.limit + index === 0 && 'bg-primary',
                        (query?.page - 1) * query?.limit + index === 1 && 'bg-gray-400',
                        (query?.page - 1) * query?.limit + index === 2 && 'bg-[#CD7F32]'
                      )}>
                      {(query?.page - 1) * query?.limit + index + 1}
                    </span>
                  </td>
                  <td className="flex items-center space-x-2">
                    <img
                      className="object-cover w-8 h-8 rounded-full"
                      src={
                        leaderboard.business?.logo?.url ||
                        callbackAvatar(leaderboard?.user?.profilePicture?.url, leaderboard?.user?.name)
                      }
                      alt=""
                    />
                    <span>{leaderboard?.business?.name || leaderboard?.user?.name}</span>
                  </td>
                  <td>{leaderboard?.activeCustomers || 0}</td>
                  <td>{leaderboard?.leads || 0}</td>
                  <td>{toCurrency(leaderboard?.revenue ? Math.round(leaderboard?.revenue / 100) : 0).replace('.00', '')}</td>
                  <td>
                    <span
                      className={clsx(
                        'justify-center rounded-lg flex items-center w-16 text-dark bg-gray-300 font-semibold',
                        index === 0 && '!bg-primary !text-white',
                        index === 1 && '!bg-gray-400 !text-white',
                        index === 2 && '!bg-[#CD7F32] !text-white'
                      )}>
                      {leaderboard?.influence || 0}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex justify-center mt-5">
        <Pagination
          initialPage={data?.meta?.page}
          pageCount={data?.meta?.pageCount}
          onPageChange={(page) => {
            setQuery({
              ...query,
              page: page || 1
            })
          }}
        />
      </div>
    </div>
  )
}
