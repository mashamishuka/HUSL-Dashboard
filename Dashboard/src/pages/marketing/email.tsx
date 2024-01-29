// import { useState } from 'react'
// import { MdArrowDropDown } from 'react-icons/md'

// import Button from '@components/Button'
import Link from 'next/link'
import useSWR from 'swr'

import { WarningAlert } from '@components/Alerts'
// import { Dropdown } from '@components/Dropdowns'
import { MainLayout } from '@components/Layouts/MainLayout'
import { Wrapper } from '@components/Layouts/Wrapper'
import { EmailListTable } from '@components/Tables/EmailList'
import { GET_EMAIL_CONFIG } from '@src/restapi/emails/constants'
import { EmailConfig } from '@src/restapi/emails/emails'

import type { NextLayoutComponentType } from 'next'
import { useHookstate } from '@hookstate/core'
import { mailCountState } from '@states/emails/mailCount'
const EmailMarketingPage: NextLayoutComponentType = () => {
  const { data } = useSWR<RestApi.Response<EmailConfig>>(GET_EMAIL_CONFIG)
  const mailCount = useHookstate(mailCountState)

  return (
    <div className="flex flex-col space-y-10">
      <div className="flex flex-col space-y-5">
        {/* <div className="flex justify-end">
          <div className="flex items-center space-x-3">
            <span>Sort By</span>
            <Dropdown
              text={
                <Button
                  variant="outline"
                  rounded="xl"
                  className="flex items-center px-5 py-3 space-x-1 font-light border-white border-opacity-50">
                  <span>{emailSortBy}</span>
                  <MdArrowDropDown className="mb-px text-xl" />
                </Button>
              }
              items={[
                {
                  label: 'Last Updated',
                  onClick: () => setEmailSortBy('Last Updated')
                },
                {
                  label: 'Title',
                  onClick: () => setEmailSortBy('Title')
                },
                {
                  label: 'Created Date',
                  onClick: () => setEmailSortBy('Created Date')
                },
                {
                  label: 'Opened',
                  onClick: () => setEmailSortBy('Opened')
                },
                {
                  label: 'Clicked',
                  onClick: () => setEmailSortBy('Clicked')
                },
                {
                  label: 'Revenue',
                  onClick: () => setEmailSortBy('Revenue')
                }
              ]}
            />
          </div>
        </div> */}
        <Wrapper
          title={
            <>
              Email <span className="text-primary"> ({mailCount?.get() || 0})</span>
            </>
          }>
          {!data?.data?.token && (
            <WarningAlert className="mb-5">
              You need to connect your HUSL Mail account to use this feature.{' '}
              <Link href="/settings/husl-app/email" passHref>
                <a className="font-medium underline text-primary">Add the configuration</a>
              </Link>{' '}
              to get started.
            </WarningAlert>
          )}
          {data?.data?.token && (
            <div className="max-w-full overflow-x-auto">
              <EmailListTable />
            </div>
          )}
        </Wrapper>
      </div>
    </div>
  )
}

EmailMarketingPage.getLayout = function getLayout(page) {
  return <MainLayout children={page} />
}

export default EmailMarketingPage
