import { useState } from 'react'

import Button from '@components/Button'
import { SEODoughnutPercentageChart, VisitorsChart } from '@components/Charts'
import { Dropdown } from '@components/Dropdowns'
import { MainLayout } from '@components/Layouts/MainLayout'
import { Wrapper } from '@components/Layouts/Wrapper'

import { MdLogin } from 'react-icons/md'
import { useCookie } from 'react-use'
import { useGoogleLogin } from '@react-oauth/google'
import type { NextLayoutComponentType } from 'next'

const EmailMarketingPage: NextLayoutComponentType = () => {
  const [activeVisitorFilter, setActiveVisitorFilter] = useState('Yearly')
  const [GA_TOKEN, updateCookie] = useCookie('ga_token')

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      updateCookie(codeResponse?.access_token, {
        expires: new Date().getTime() + codeResponse?.expires_in * 1000
      })
    },
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    flow: 'implicit'
  })

  return (
    <div className="flex flex-col space-y-5">
      <div className="flex justify-end">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            className="flex items-center space-x-2 border-white border-opacity-50 rounded-xl !text-primary !px-3 !py-2">
            <span>View Website</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center space-x-2 border-white border-opacity-50 rounded-xl !text-primary !px-3 !py-2">
            <span>View Website</span>
          </Button>
          <Button
            type="button"
            variant="dark"
            size="sm"
            className="flex items-center space-x-2 border border-blue-500"
            onClick={() => login()}>
            <MdLogin />
            {GA_TOKEN ? <span>Reconnect Account</span> : <span>Connect Account</span>}
          </Button>
        </div>
      </div>
      <Wrapper
        title={
          <>
            <span>Visitors</span>
            <span className="ml-2 text-sm font-light text-[#7C7C7C]">(Updated Recently)</span>
          </>
        }
        subtitle={<span className="font-light text-sm text-[#7C7C7C]">July 2021 - August 2022</span>}
        actionEl={
          <Dropdown
            text={activeVisitorFilter}
            items={[
              {
                label: 'Yearly',
                onClick: () => setActiveVisitorFilter('Yearly')
              },
              {
                label: 'Monthly',
                onClick: () => setActiveVisitorFilter('Monthly')
              },
              {
                label: 'Weekly',
                onClick: () => setActiveVisitorFilter('Weekly')
              }
            ]}
          />
        }>
        <div className="h-72">
          <VisitorsChart />
        </div>
      </Wrapper>
      <div className="grid md:grid-cols-2">
        <Wrapper title="Stats" subtitle="SEO Stats">
          <div className="w-7/12 mx-auto">
            <SEODoughnutPercentageChart />
          </div>
        </Wrapper>
      </div>
    </div>
  )
}

EmailMarketingPage.getLayout = function getLayout(page) {
  return <MainLayout children={page} />
}

export default EmailMarketingPage
