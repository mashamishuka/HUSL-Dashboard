import { AddTipsNTrickForm } from '@components/Forms/AddTipsNTrick'
import { RoadmapCreator } from '@components/Forms/RoadmapCreator'
import { SettingsLayout } from '@components/Layouts/SettingsLayout'
import { Wrapper } from '@components/Layouts/Wrapper'

import type { NextLayoutComponentType } from 'next'
const RoadmapSettingsPage: NextLayoutComponentType = () => {
  return (
    <div className="grid lg:grid-cols-2 lg:gap-x-5 gap-y-5 md:gap-y-0">
      <Wrapper title="Brand Overview" className="flex flex-col space-y-5">
        <AddTipsNTrickForm />
      </Wrapper>
      <Wrapper title="Roadmap Creator" className="flex flex-col space-y-5">
        <RoadmapCreator />
      </Wrapper>
    </div>
  )
}

RoadmapSettingsPage.getLayout = function getLayout(page) {
  return <SettingsLayout children={page} />
}

export default RoadmapSettingsPage
