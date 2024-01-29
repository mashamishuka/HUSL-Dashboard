// import { Balance } from '@src/restapi/finances'
import { transformCents } from '@utils/index'

// import useSWR from 'swr'

export const AnnuallyBalance = ({ balance }: { balance: number }) => {
  //const { data } = useSWR<RestApi.Response<Balance>>(GET_ANNUALLY_BALANCE_REPORT)
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
        <span>Payout</span>
        <h1 className="text-3xl font-bold text-primary">{transformCents(/*data?.data?.payout*/ 0)}</h1>
        <span className="font-light text-[#7C7C7C]">Fees: {transformCents(/*data?.data?.fees*/ 0)}</span>
      </div>
    </div>
  )
}
