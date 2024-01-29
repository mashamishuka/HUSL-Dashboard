// import { Balance } from '@src/restapi/finances'
// import { GET_MONTHLY_BALANCE_REPORT } from '@src/restapi/finances/constants'
import { transformCents } from '@utils/index'

// import useSWR from 'swr'

export const MonthlyBalance = ({ balance, pending, fees }: { balance: number; pending: number; fees: number }) => {
  //const { data } = useSWR<RestApi.Response<Balance>>(GET_MONTHLY_BALANCE_REPORT)
  return (
    <div>
      <div className="mt-10">
        <span>Balance</span>
        <h1 className="text-3xl font-bold text-primary">{transformCents(/*data?.data?.balance*/ balance)}</h1>
        <span className="font-light text-[#7C7C7C]">
          Available balance: {transformCents(/*data?.data?.availableBalance*/ balance)}
        </span>
      </div>
      <div className="mt-5">
        <span>Pending</span>
        <div className="text-[#7C7C7C] text-xs">Pending funds to be paid out in USDH</div>
        <h1 className="text-3xl font-bold text-primary">{transformCents(pending)}</h1>
        <span className="font-light text-[#7C7C7C]">Fees: {transformCents(fees)}</span>
      </div>
    </div>
  )
}
