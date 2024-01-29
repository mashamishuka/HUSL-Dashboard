import { MainLayout } from '@components/Layouts/MainLayout'
import { Wrapper } from '@components/Layouts/Wrapper'
import { GenericCRMListTable } from '@components/Tables'

import type { NextLayoutComponentType } from 'next'
const PartnershipPage: NextLayoutComponentType = () => {
  return (
    <div className="flex flex-col space-y-3">
      <Wrapper title="Generic CRM List">
        <div className="max-w-full overflow-x-auto">
          <GenericCRMListTable />
        </div>
      </Wrapper>
    </div>
  )
}

PartnershipPage.getLayout = function getLayout(page) {
  return <MainLayout children={page} />
}

export default PartnershipPage
