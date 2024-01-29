import { MainLayout } from '@components/Layouts/MainLayout'
import { Wrapper } from '@components/Layouts/Wrapper'

import type { NextLayoutComponentType } from 'next'
import { LeadList } from '@components/DataTables/LeadList'
// import { useSession } from 'next-auth/react'
import { useMemo } from 'react'
import { Services } from '@components/Service'
import { ErrorAlert } from '@components/Alerts'
import { NicheScriptList } from '@components/DataTables/NicheScriptList'
import { usePurchases } from '@hooks/usePurchases'
import { Loading } from '@components/Icons'

function isValidSubscriptionInPurchases(purchases: { name: string; state?: string }[]) {
  if (purchases) {
    for (let i = 0; i < purchases.length; i++) {
      if (purchases[i].name === 'subscription' && purchases[i].state === 'completed') {
        return true
      }
    }
  }
  return false
}

const OutreachCenterPage: NextLayoutComponentType = () => {
  // const { data: session } = useSession()
  const { data: purchases, isLoading } = usePurchases()
  const isSubscribed = useMemo(() => {
    if (!purchases?.data) return false
    return isValidSubscriptionInPurchases(purchases?.data as any)
  }, [purchases])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-80">
        <Loading />
      </div>
    )
  }
  return (
    <div className="flex flex-col space-y-5">
      {isSubscribed && (
        <div className="flex flex-col space-y-5 md:space-x-3 md:flex-row md:space-y-0">
          <Wrapper title="Leads" className="w-full md:w-1/2">
            <LeadList />
          </Wrapper>
          <Wrapper title="Scripts" className="w-full md:w-1/2">
            <NicheScriptList />
          </Wrapper>
        </div>
      )}
      {!isSubscribed && (
        <>
          <ErrorAlert>You must be subscribed to organic growth to use this tool</ErrorAlert>
          <Services hidePurchases hideDescription />
        </>
      )}
    </div>
  )
}

OutreachCenterPage.getLayout = function getLayout(page) {
  return <MainLayout children={page} />
}

export default OutreachCenterPage
