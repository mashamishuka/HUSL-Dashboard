import { AddAccountCompact } from '@components/Forms'
import { MainLayout } from '@components/Layouts/MainLayout'
import { Wrapper } from '@components/Layouts/Wrapper'
import { CompactModal } from '@components/Modals'
import { AccessManagerTable } from '@components/Tables'

import type { NextLayoutComponentType } from 'next'
import { useRef, useState } from 'react'
import { MdAdd } from 'react-icons/md'
const AccessManagerPage: NextLayoutComponentType = () => {
  const [addSiteModal, setAddSiteModal] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  return (
    <div className="flex flex-col space-y-5">
      <Wrapper
        title="Table"
        actionEl={
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={() => setAddSiteModal(true)}
              className="flex items-center px-5 py-2 space-x-2 text-sm border border-white rounded-lg">
              <MdAdd />
              <span>Add Site</span>
            </button>
          </div>
        }>
        <div className="max-w-full py-5 -mt-4 overflow-x-auto md:py-0 md:mt-0">
          <AccessManagerTable />
        </div>
      </Wrapper>
      <CompactModal
        show={addSiteModal}
        onClose={() => setAddSiteModal(false)}
        pos={{
          x: (buttonRef.current?.getBoundingClientRect().x || 0) + (buttonRef?.current?.clientWidth || 0),
          y: (buttonRef.current?.getBoundingClientRect().y || 0) + (buttonRef?.current?.clientHeight || 0) + 20
        }}>
        <p className="mb-3">Create an end user account!</p>
        <AddAccountCompact />
      </CompactModal>
    </div>
  )
}

AccessManagerPage.getLayout = function getLayout(page) {
  return <MainLayout children={page} />
}

export default AccessManagerPage
