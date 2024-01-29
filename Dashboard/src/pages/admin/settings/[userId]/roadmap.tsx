import { BrandOverviewForm } from '@components/Forms/admin/AddBrandOverview'
import { RoadmapCreator } from '@components/Forms/admin/RoadmapCreator'
import { AdminUserConfigLayout } from '@components/Layouts/AdminUserConfig'
import { Wrapper } from '@components/Layouts/Wrapper'

import type { NextLayoutComponentType } from 'next'
import { useRouter } from 'next/router'
import { MdChevronLeft } from 'react-icons/md'
const RoadmapSettingsPage: NextLayoutComponentType = () => {
  const { push } = useRouter()
  return (
    <div>
      <button onClick={() => push('/admin/accounts')} className="flex items-center mb-3 space-x-2">
        <MdChevronLeft size={16} />
        <span>Back to Account List</span>
      </button>
      <div className="grid lg:grid-cols-2 lg:gap-x-5 gap-y-5 md:gap-y-0">
        <Wrapper title="Brand Overview" className="flex flex-col space-y-5">
          <BrandOverviewForm />
        </Wrapper>
        <Wrapper title="Roadmap Creator" className="flex flex-col space-y-5">
          <RoadmapCreator />
        </Wrapper>
      </div>
    </div>
  )
}

RoadmapSettingsPage.getLayout = function getLayout(page) {
  return <AdminUserConfigLayout children={page} />
}

export default RoadmapSettingsPage
