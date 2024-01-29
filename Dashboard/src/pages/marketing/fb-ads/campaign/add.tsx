import { FBCampaignAdd } from '@components/Forms/FBCampaignAdd'
import { MainLayout } from '@components/Layouts/MainLayout'
import type { NextLayoutComponentType } from 'next'

const ManageCampaign: NextLayoutComponentType = () => {
  return (
    <div className="flex flex-col space-y-5">
      <FBCampaignAdd />
    </div>
  )
}

ManageCampaign.getLayout = function getLayout(page) {
  return <MainLayout children={page} />
}

export default ManageCampaign
