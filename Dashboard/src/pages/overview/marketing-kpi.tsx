import { useState } from 'react'

import { CPABarChart, CPCBarChart, CPCChart } from '@components/Charts'
import { Dropdown } from '@components/Dropdowns'
import { MainLayout } from '@components/Layouts/MainLayout'
import { Wrapper } from '@components/Layouts/Wrapper'

import type { NextLayoutComponentType } from 'next'
import moment from 'moment'
type periodeType = 'yearly' | 'monthly' | 'weekly'
const MarketingKPIPage: NextLayoutComponentType = () => {
  const [activeCPCFilter, setActiveCPCFilter] = useState<periodeType>('yearly')

  return (
    <div className="flex flex-col space-y-5">
      <Wrapper
        title="Cost Per Click (CPC)"
        actionEl={
          <Dropdown
            text={activeCPCFilter}
            items={[
              {
                label: 'Yearly',
                onClick: () => setActiveCPCFilter('yearly')
              },
              {
                label: 'Monthly',
                onClick: () => setActiveCPCFilter('monthly')
              },
              {
                label: 'Weekly',
                onClick: () => setActiveCPCFilter('weekly')
              }
            ]}
          />
        }>
        <div className="mt-10 md:mt-6">
          <CPCChart height={100} periodType={activeCPCFilter} />
        </div>
      </Wrapper>
      <div className="grid md:grid-cols-2 md:gap-x-5 gap-y-5 md:gap-y-0">
        <Wrapper
          title="Cost Per Click (CPC)"
          actionEl={
            <Dropdown
              text={activeCPCFilter}
              items={[
                {
                  label: 'Yearly',
                  onClick: () => setActiveCPCFilter('yearly')
                },
                {
                  label: 'Monthly',
                  onClick: () => setActiveCPCFilter('monthly')
                },
                {
                  label: 'Weekly',
                  onClick: () => setActiveCPCFilter('weekly')
                }
              ]}
            />
          }>
          <div className="mt-10 md:mt-6">
            <CPCBarChart />
          </div>
        </Wrapper>
        <Wrapper
          title="Cost Per Action (CPA)"
          subtitle={
            <span className="font-light text-sm text-[#7C7C7C]">
              {moment().startOf('year').format('MMMM YYYY')} - {moment().endOf('year').format('MMMM YYYY')}
            </span>
          }>
          <div className="mt-10 md:mt-6">
            <CPABarChart />
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
