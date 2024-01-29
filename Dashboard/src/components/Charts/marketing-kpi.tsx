import { MdArrowDropDown } from 'react-icons/md'

import Button from '@components/Button'
import { CPCBarChart, CPCChart, CustomerChurnRateChart } from '@components/Charts'
import { MainLayout } from '@components/Layouts/MainLayout'
import { Wrapper } from '@components/Layouts/Wrapper'

import type { NextLayoutComponentType } from 'next'

const MarketingKPIPage: NextLayoutComponentType = () => {
  return (
    <div className="flex flex-col space-y-5">
      <Wrapper
        title="Cost Per Click (CPC)"
        subtitle={<span className="font-light text-sm text-[#7C7C7C]">July 2021 - August 2022</span>}
        actionEl={
          <Button variant="outline" className="flex items-center space-x-2 border-white border-opacity-50 rounded-xl">
            <span>Yearly</span>
            <MdArrowDropDown className="text-xl text-primary" />
          </Button>
        }>
        <CPCChart height={100} />
      </Wrapper>
      <div className="grid grid-cols-2 gap-x-5">
        <Wrapper
          title="Cost Per Click (CPC)"
          subtitle={<span className="font-light text-sm text-[#7C7C7C]">July 2021 - August 2022</span>}
          actionEl={
            <Button variant="outline" className="flex items-center space-x-2 border-white border-opacity-50 rounded-xl">
              <span>Yearly</span>
              <MdArrowDropDown className="text-xl text-primary" />
            </Button>
          }>
          <div className="mt-6">
            <CPCBarChart />
          </div>
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

MarketingKPIPage.getLayout = function getLayout(page) {
  return <MainLayout children={page} />
}

export default MarketingKPIPage
