import clsx from 'clsx'
import { Fragment, useState } from 'react'

import { MainLayout } from '@components/Layouts/MainLayout'
import { Wrapper } from '@components/Layouts/Wrapper'
import { AdSetTable, CampaignTable, MarketingAdTable } from '@components/Tables/static'
import { Tab } from '@headlessui/react'

import type { NextLayoutComponentType } from 'next'
import { WarningAlert } from '@components/Alerts'
import { FbAdsConfig } from '@src/restapi/fbads/fbads'
import { GET_CONFIG } from '@src/restapi/fbads/constants'
import useSWR from 'swr'
import Link from 'next/link'
import { useRouter } from 'next/router'

const FbPixelMarketingPage: NextLayoutComponentType = () => {
  const { data } = useSWR<RestApi.Response<FbAdsConfig>>(GET_CONFIG)
  const { push, query } = useRouter()
  const [tabIndex, setTabIndex] = useState(Number(query?.tabIndex) || 0)

  const handleTabIndexChange = (index: number) => {
    setTabIndex(index)
    push(`/marketing/fb-ads?tabIndex=${index}`)
  }
  return (
    <div className="flex flex-col space-y-5">
      <Wrapper>
        {!data?.data?.hasToken && (
          <WarningAlert className="mb-5" noHide>
            You need to connect your Meta Ads account to use this feature.
          </WarningAlert>
        )}

        {
          <Tab.Group defaultIndex={tabIndex} onChange={handleTabIndexChange}>
            <Tab.List className="relative">
              <Tab as={Fragment}>
                {({ selected }) => (
                  <div className="inline-flex">
                    <button className={clsx('py-1 px-3', selected && 'bg-dark')}>Campaigns</button>
                    {/* {selected && (
                      <button
                        onClick={() => push('/marketing/fb-ads/campaign/add')}
                        className="absolute right-0 underline text-primary">
                        Add New Campaign
                      </button>
                    )} */}
                  </div>
                )}
              </Tab>
              <Tab as={Fragment}>
                {({ selected }) => <button className={clsx('py-1 px-3', selected && 'bg-dark')}>Ad Sets</button>}
              </Tab>
              <Tab as={Fragment}>
                {({ selected }) => (
                  <div className="inline-flex">
                    <button className={clsx('py-1 px-3', selected && 'bg-dark')}>Ads</button>
                    {/* {selected && <button className="absolute right-0 underline text-primary">Add New Ads</button>} */}
                  </div>
                )}
              </Tab>
              {/* show in tab if there's a token */}
              {data?.data?.hasToken && (
                <Tab as={Fragment}>
                  <Link href="/settings/facebook" passHref>
                    <a className="px-3 py-1">
                      <span className="hidden md:inline">Configuration</span>
                      <span className="inline md:hidden">Config</span>
                    </a>
                  </Link>
                </Tab>
              )}
            </Tab.List>
            <Tab.Panels>
              <Tab.Panel>
                <div className="max-w-full overflow-x-auto">
                  <CampaignTable />
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div className="max-w-full overflow-x-auto">
                  <AdSetTable />
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div className="max-w-full overflow-x-auto">
                  <MarketingAdTable />
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        }
      </Wrapper>
    </div>
  )
}

FbPixelMarketingPage.getLayout = function getLayout(page) {
  return <MainLayout children={page} />
}

export default FbPixelMarketingPage
