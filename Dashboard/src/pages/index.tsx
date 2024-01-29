// import Image from 'next/image'

// import { MainLayout } from '@components/Layouts/MainLayout'

// import type { NextLayoutComponentType } from 'next'

// const SplashPage: NextLayoutComponentType = () => {
//   return (
//     <div>
//       <div className="flex items-center justify-center w-full">
//         <div className="w-full mt-20">
//           <Image src="/static/images/husl_banner.png" layout="responsive" width={1240} height={400} />
//         </div>
//       </div>
//     </div>
//   )
// }

// SplashPage.getLayout = function getLayout(page) {
//   return <MainLayout children={page} />
// }

import { MainLayout } from '@components/Layouts/MainLayout'
import { useMemo } from 'react'
import { useRouter } from 'next/router'
import { useSetting } from '@hooks/useSetting'
import { useActiveBusiness } from '@hooks/useActiveBusiness'
import { useBusiness } from '@hooks/useBusiness'
import OnboardingPage from './onboarding'
// import OverviewPage from './overview'

import type { NextLayoutComponentType } from 'next'
import RewardsPage from './benefits'
import CustomerKPIPage from './overview/customer-kpi'
import { useMe } from '@hooks/useMe'

const Page: NextLayoutComponentType = () => {
  const { me } = useMe()
  const router = useRouter()
  const settings = useSetting('show-onboarding')
  const { business: activeBusiness } = useActiveBusiness()
  const { data: business } = useBusiness(activeBusiness?._id)

  const isOnboardingShow = useMemo(() => {
    if (!activeBusiness) return false
    if (business?.data?.onboardingCompleted) return false
    if (settings?.value) return true
    return false
  }, [business, router])

  if (isOnboardingShow) {
    return <OnboardingPage />
  }
  // else {
  //   return <OverviewPage />
  // }
  if (me?.nftId[0] !== '-') {
    return <CustomerKPIPage />
  } else if (me?.foundersCard) {
    return <RewardsPage />
  }

  return <div>It looks like you have neither founder cards nor business NFTs...</div>
}

Page.getLayout = function getLayout(page) {
  return <MainLayout children={page} />
}

export default Page
