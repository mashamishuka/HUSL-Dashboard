// import Button from '@components/Button'
import { SEODoughnutPercentageChart, VisitorsChart } from '@components/Charts'
import { MainLayout } from '@components/Layouts/MainLayout'
import { Wrapper } from '@components/Layouts/Wrapper'

import type { NextLayoutComponentType } from 'next'
import useSWR from 'swr'
import { GET_GA_CONFIG } from '@src/restapi/ganalytics/constants'
import moment from 'moment'

const EmailMarketingPage: NextLayoutComponentType = () => {
  const { data } = useSWR<RestApi.Response<GAnalyticConfig>>(GET_GA_CONFIG)

  return (
    <div className="flex flex-col space-y-5">
      {/* <div className="flex justify-end">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            className="flex items-center space-x-2 border-white border-opacity-50 rounded-xl !text-primary !px-3 !py-2">
            <span>View Website</span>
          </Button>
        </div>
      </div> */}
      <Wrapper
        title="Visitors"
        subtitle={
          <div className="flex space-x-3">
            {data?.data?.propertyId && <span>Property Id: {data?.data?.propertyId}</span>}
            {data?.data?.pageViews?.lastUpdatedAt && (
              <span>Last updated at: {moment(data?.data?.pageViews?.lastUpdatedAt)?.format('LL LT')}</span>
            )}
            <span></span>
          </div>
        }>
        <div className="h-72">
          <VisitorsChart />
        </div>
      </Wrapper>
      <div className="grid md:grid-cols-2">
        <Wrapper
          title="Browser Stats"
          subtitle={
            data?.data?.browser?.lastUpdatedAt
              ? `Last updated at: ${moment(data?.data?.browser?.lastUpdatedAt)?.format('LL LT')}`
              : ''
          }>
          <SEODoughnutPercentageChart />
        </Wrapper>
      </div>
    </div>
  )
}

EmailMarketingPage.getLayout = function getLayout(page) {
  return <MainLayout children={page} />
}

export default EmailMarketingPage
