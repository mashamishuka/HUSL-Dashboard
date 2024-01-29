import { CustomerChart, CustomerChurnRateChart, GrowthChart } from '@components/Charts'
import { MainLayout } from '@components/Layouts/MainLayout'
import { Wrapper } from '@components/Layouts/Wrapper'

import type { NextLayoutComponentType } from 'next'
const CustomerKPIPage: NextLayoutComponentType = () => {
  return (
    <div className="flex flex-col pb-10 space-y-5">
      <Wrapper
        title={
          <>
            <span>Growth</span>
            <span className="ml-2 text-sm font-light text-[#7C7C7C]">(Over Time)</span>
          </>
        }>
        <div className="mt-10 md:mt-0">
          <GrowthChart />
        </div>
      </Wrapper>
      <div className="grid md:grid-cols-2 md:gap-x-5 gap-y-5 md:gap-y-0">
        <Wrapper title="Customer">
          <CustomerChart />
        </Wrapper>
        <Wrapper title="Customer Churn Rate" subtitle="Cancellation Over Time">
          <div className="w-7/12 mx-auto">
            <CustomerChurnRateChart />
          </div>
        </Wrapper>
      </div>
    </div>
  )
}

CustomerKPIPage.getLayout = function getLayout(page) {
  return <MainLayout children={page} />
}

export default CustomerKPIPage
