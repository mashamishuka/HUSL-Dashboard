// import { OverviewChart } from '@components/Charts/Overview'
import { MainLayout } from '@components/Layouts/MainLayout'

import type { NextLayoutComponentType } from 'next'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

const OverviewPage: NextLayoutComponentType = () => {
  const router = useRouter()
  // temporary disable it
  useEffect(() => {
    router.push('/')
  }, [])
  return (
    <div>
      {/* <h1 className="mb-5 text-xl font-semibold">Overview</h1>
      <OverviewChart /> */}
    </div>
  )
}

OverviewPage.getLayout = function getLayout(page) {
  return <MainLayout children={page} />
}

export default OverviewPage
