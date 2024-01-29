import { MdAdd } from 'react-icons/md'

import Button from '@components/Button'
import { MainLayout } from '@components/Layouts/MainLayout'
import { Wrapper } from '@components/Layouts/Wrapper'
import { GenericCRMListTable } from '@components/Tables'

import type { NextLayoutComponentType } from 'next'

const CustomerPortalPage: NextLayoutComponentType = () => {
  return (
    <div className="flex flex-col space-y-3">
      <div className="flex justify-end">
        <Button
          url="/customer-portal/add"
          variant="outline"
          rounded="xl"
          className="flex items-center px-5 py-3 mb-3 space-x-1 text-xl font-light">
          <MdAdd />
          <span>Add Customer</span>
        </Button>
      </div>
      <Wrapper title="Generic CRM List">
        <div className="max-w-full overflow-x-auto md:max-w-none md:overflow-visible">
          <GenericCRMListTable />
        </div>
      </Wrapper>
    </div>
  )
}

CustomerPortalPage.getLayout = function getLayout(page) {
  return <MainLayout children={page} />
}

export default CustomerPortalPage
