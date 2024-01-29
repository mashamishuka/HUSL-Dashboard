import moment from 'moment'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import useSWR from 'swr'

import { GrowthChart, RevenueChart } from '@components/Charts'
import { MonthlyBalance } from '@components/Charts/Balance'
import { ChurnRateCompactChart } from '@components/Charts/CustomerChurnRate/DoughnutCompact'
import { Dropdown } from '@components/Dropdowns'
import { MainLayout } from '@components/Layouts/MainLayout'
import { Wrapper } from '@components/Layouts/Wrapper'
import { useMe } from '@hooks/useMe'
import { StripeConfig } from '@src/restapi/finances'
import { GET_STRIPE_CONFIG, GET_USER_INVOICES } from '@src/restapi/finances/constants'
import { getUserData } from '@utils/lib/fetchBalance'
import { get_founder_cards } from '@src/restapi/payouts/mutation'

import type { NextLayoutComponentType } from 'next'
import { GET_USER_PAYOUTS } from '@src/restapi/payouts/constants'
import calc_earnings_for_whitelabel from '@utils/calc_earnings_for_whitelabel'
import { transformCents } from '@utils/index'

declare type TransactionData = { timestamp: number; value: number; tx_hash: string }

function read_unix(unix_timestamp: number) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const date = new Date(unix_timestamp * 1000)
  const month = months[date.getMonth()]
  const string = `${month}/${date.getDate()}, ${date.getFullYear()} - ${date.getHours()}:${date.getMinutes()}`
  return string
}

const Transaction = ({ data }: { data: TransactionData }) => {
  return (
    <div
      className="flex items-center px-2 py-1 border-white rounded-md border-opacity-10 border-[1.5px]"
      style={{ width: '100%', marginBottom: 5, paddingLeft: 10 }}>
      <div className="mr-2 font-semibold text-right text-primary text-[23px] w-[150px] pt-[3px]">
        +{transformCents(data.value)}
      </div>
      <div className="truncate">
        <a href={`https://etherscan.io/tx/${data.tx_hash}`} target="_blank">
          <div className="text-[#666] text-[10px] monospace cursor-pointer truncate">{data.tx_hash}</div>
        </a>
        <div className="text-[#666] text-[10px]">{read_unix(data.timestamp)}</div>
      </div>
      {/*data.tx_hash*/}
    </div>
  )
}

const RecentTransactions = ({ transactions }: { transactions: TransactionData[] }) => {
  return (
    <>
      {transactions.map((transaction: TransactionData, index: number) => (
        <Transaction data={transaction} key={index} />
      ))}
      <button
        className="flex items-center justify-center h-10 border-white border-opacity-50 rounded-xl border-[1.5px]"
        style={{ width: 100 }}>
        see more
      </button>
    </>
  )
}

type periodeType = 'last_year' | 'this_year' | 'this_month' | 'this_week'

const periodeType = {
  last_year: 'Last Year',
  this_year: 'This Year',
  this_month: 'This Month',
  this_week: 'This Week'
}
const RevenuePage: NextLayoutComponentType = () => {
  const [activeRevenueFilter, setActiveRevenueFilter] = useState<periodeType>('this_week')

  const { push, asPath } = useRouter()
  const { data, error } = useSWR<RestApi.Response<StripeConfig>>(GET_STRIPE_CONFIG)
  const [balance, set_balance] = useState(0)
  const [pending, set_pending] = useState(-1)
  const [amount_due, set_amount_due] = useState(-1)
  const { data: user } = useMe()
  const { data: payouts } = useSWR<RestApi.Response<any>>(GET_USER_PAYOUTS)
  const { data: invoices } = useSWR<RestApi.Response<any>>(`${GET_USER_INVOICES}?unix_min=0&unix_max=2000000000`)

  useEffect(() => {
    if (invoices && payouts && user) {
      const last_payout_timestamp = Math.max(0, ...payouts?.data.payouts.map(({ created }: { created: number }) => created))
      const { locked_earnings } = calc_earnings_for_whitelabel(invoices?.data, last_payout_timestamp, 'all')

      set_pending(locked_earnings)

      try {
        get_founder_cards(user?.data?.nftId).then((founder_cards) => {
          const payout_ratio = (founder_cards?.length || 0) >= 15 ? 0.77 : 0.76
          set_amount_due(locked_earnings * payout_ratio)
        })
      } catch (error) {
        console.error(error)
      }
    }
  }, [invoices, payouts, user])

  useEffect(() => {
    const nftId = user?.data?.nftId
    if (nftId) {
      getUserData(nftId).then(({ balance }) => {
        set_balance(balance)
      })
    }
  }, [user])

  const payout_transactions = payouts?.data.payouts.map(
    ({ created, amount_paid, transaction }: { created: number; amount_paid: number; transaction: any }) => ({
      timestamp: created,
      value: amount_paid,
      tx_hash: transaction.transactionHash
    })
  )

  useEffect(() => {
    if (!error && !data) return

    if (!data?.data?.secretKey || !data?.data?.publishableKey) {
      toast.error('Stripe config invalid or not added yet.', {
        toastId: 'stripe-config',
        autoClose: false,
        position: 'bottom-right',
        style: {
          fontSize: 14
        },
        closeOnClick: false,
        onClick: () => push('/settings/stripe')
      })
    }
    return () => {
      toast.dismiss('stripe-config')
    }
  }, [data, asPath])
  return (
    <div className="flex flex-col pb-10 space-y-5">
      <div className="flex flex-col space-y-3 md:space-x-5 md:flex-row md:space-y-0">
        <Wrapper
          title="Revenue"
          className="w-full md:w-[66.1%]"
          actionEl={
            <Dropdown
              text={periodeType[activeRevenueFilter]}
              items={[
                {
                  label: 'Last Year',
                  onClick: () => setActiveRevenueFilter('last_year')
                },
                {
                  label: 'This Year',
                  onClick: () => setActiveRevenueFilter('this_year')
                },
                {
                  label: 'This Month',
                  onClick: () => setActiveRevenueFilter('this_month')
                },
                {
                  label: 'This Week',
                  onClick: () => setActiveRevenueFilter('this_week')
                }
              ]}
            />
          }>
          <RevenueChart reportType={activeRevenueFilter} />
        </Wrapper>
        <Wrapper
          title="Monthly Balances"
          subtitle={`${moment().startOf('month').format('DD MMM YYYY')} - ${moment().format('DD MMM YYYY')}`}
          className="flex-1">
          <MonthlyBalance
            balance={balance / 1e16 /* 18 decimals minus 2 to switch from USD -> cents */}
            pending={amount_due}
            fees={pending - amount_due}
          />
        </Wrapper>
      </div>
      <div className="grid md:grid-cols-3 md:gap-x-5 gap-y-5 md:gap-y-0">
        <Wrapper title="Growth Chart">
          <div className="mt-14">
            <GrowthChart compact />
          </div>
        </Wrapper>
        <Wrapper title="Churn Rate">
          <div>
            <ChurnRateCompactChart />
          </div>
        </Wrapper>
        <Wrapper title="Recent transactions" subtitle={`These are gross transactions, pre Stripe & Husl fees.`}>
          <RecentTransactions transactions={payout_transactions || []} />
          {/*<AnnuallyBalance balance={balance} />*/}
        </Wrapper>
      </div>
    </div>
  )
}

RevenuePage.getLayout = function getLayout(page) {
  return <MainLayout children={page} />
}

export default RevenuePage
