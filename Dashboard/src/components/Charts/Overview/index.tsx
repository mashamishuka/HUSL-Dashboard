import { MdAttachMoney, MdOutlineInfo, MdSubscriptions } from 'react-icons/md'
import { TbSocial } from 'react-icons/tb'
import { FaFileInvoiceDollar } from 'react-icons/fa'
import { Tooltip } from 'react-tooltip'
import { ActiveCustomerChart } from '../ActiveCustomer'
import useSWR from 'swr'
import { useMemo } from 'react'

const initialStats = [
  { id: 1, name: 'Total Recurring', icon: MdSubscriptions },
  {
    id: 2,
    name: 'Leads',
    description: 'Leads are total number of people registered on your product but not paying.',
    stat: '58.16%',
    icon: FaFileInvoiceDollar
  },
  { id: 3, name: 'Total Influence', stat: '24.57%', icon: TbSocial },
  { id: 4, name: 'Gross Revenue', stat: '24.57%', icon: MdAttachMoney }
]
export const OverviewChart = () => {
  const { data } = useSWR<RestApi.Response<any>>('/businesses/overview')

  const stats = useMemo(() => {
    const grossRevenue = data?.data?.grossRevenue || 0
    const totalRecurring = data?.data?.customers || 0
    const totalInfluence = data?.data?.influence || 0
    const leads = data?.data?.leads || 0

    return initialStats.map((item) => {
      switch (item.id) {
        case 1:
          return {
            ...item,
            stat: totalRecurring
          }
        case 2:
          return {
            ...item,
            stat: leads
          }
        case 3:
          return {
            ...item,
            stat: totalInfluence
          }
        case 4:
          return {
            ...item,
            stat: grossRevenue
          }
        default:
          return item
      }
    })
  }, [data?.data])

  return (
    <div
      className="grid gap-x-5"
      style={{
        gridTemplateColumns: '1fr .4fr'
      }}>
      <div className="relative px-4 py-5 rounded-lg shadow bg-secondary sm:px-6 sm:py-7">
        <div className="mb-5">
          <dt>
            <p className="text-sm font-medium truncate text-darkGrey">Active Customers</p>
          </dt>
          <dd className="flex items-baseline">
            <p className="text-2xl font-semibold">{data?.data?.activeCustomers?.total}</p>
          </dd>
        </div>
        <ActiveCustomerChart />
      </div>
      <dl className="grid w-full grid-rows-4 gap-y-5">
        {stats.map((item, i) => (
          <div key={item.id} className="relative flex-col w-full px-4 py-5 rounded-lg shadow bg-secondary sm:px-6 sm:py-7">
            <dt>
              <div className="absolute p-3 rounded-md bg-primary">
                <item.icon className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <div className="flex items-center ml-16 space-x-1">
                <p className="text-sm font-medium truncate text-darkGrey">{item.name}</p>
                {item?.description && <MdOutlineInfo id={`tooltip-${i}`} />}
              </div>
            </dt>
            <dd className="flex items-baseline ml-16">
              <p className="text-2xl font-semibold">{item.stat}</p>
            </dd>
            {item.description && (
              <Tooltip anchorId={`tooltip-${i}`} content={item?.description} place="left" variant="light" />
            )}
          </div>
        ))}
      </dl>
    </div>
  )
}
