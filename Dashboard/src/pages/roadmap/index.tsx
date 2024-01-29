import { MainLayout } from '@components/Layouts/MainLayout'
import { Wrapper } from '@components/Layouts/Wrapper'

import type { NextLayoutComponentType } from 'next'
import { BrandOverview } from '@components/BrandOverview'
import { ToolsAndResorces } from '@components/BrandOverview/ToolsAndResources'

const RoadmapPage: NextLayoutComponentType = () => {
  return (
    <div className="flex flex-col pb-10 space-y-5 md:space-x-5 md:flex-row md:space-y-0">
      <Wrapper title="Brand Overview" className="w-full md:w-1/2">
        <BrandOverview />
      </Wrapper>
      <ToolsAndResorces />
    </div>
  )
}

RoadmapPage.getLayout = function getLayout(page) {
  return <MainLayout children={page} />
}

export default RoadmapPage
