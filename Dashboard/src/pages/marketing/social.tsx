import { AddSocialCompact } from '@components/Forms/AddSocialCompact'
import { MainLayout } from '@components/Layouts/MainLayout'
import { Wrapper } from '@components/Layouts/Wrapper'
import { CompactModal } from '@components/Modals'
import { SocialMarketingListTable } from '@components/Tables'
import { useActiveBusiness } from '@hooks/useActiveBusiness'
import { useClientOnly } from '@hooks/useClientOnly'

import type { NextLayoutComponentType } from 'next'
import { useRef, useState } from 'react'
import { MdAdd } from 'react-icons/md'

const MarketingSocialPage: NextLayoutComponentType = () => {
  const [addSiteModal, setAddSiteModal] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { business: activeBusiness } = useActiveBusiness()
  const isHydrated = useClientOnly()

  return (
    <div className="flex flex-col space-y-5">
      <Wrapper
        title="Social Accounts"
        actionEl={
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={() => setAddSiteModal(true)}
              className="flex items-center px-5 py-2 space-x-2 text-sm border border-white rounded-lg">
              <MdAdd />
              <span>Add Social</span>
            </button>
          </div>
        }>
        {isHydrated && (
          <div key={activeBusiness?._id} className="max-w-full overflow-x-auto">
            <SocialMarketingListTable />
          </div>
        )}
      </Wrapper>
      <CompactModal
        show={addSiteModal}
        onClose={() => setAddSiteModal(false)}
        pos={{
          x: (buttonRef.current?.getBoundingClientRect().x || 0) + (buttonRef?.current?.clientWidth || 0),
          y: (buttonRef.current?.getBoundingClientRect().y || 0) + (buttonRef?.current?.clientHeight || 0) + 20
        }}>
        <p className="mb-3">Create a social account!</p>
        <AddSocialCompact />
      </CompactModal>
    </div>
  )
}

MarketingSocialPage.getLayout = function getLayout(page) {
  return <MainLayout children={page} />
}

export default MarketingSocialPage
