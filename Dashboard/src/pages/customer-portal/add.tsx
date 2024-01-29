import { AddCustomer } from '@components/Forms/Customers'
import { MainLayout } from '@components/Layouts/MainLayout'
import { Wrapper } from '@components/Layouts/Wrapper'

import type { NextLayoutComponentType } from 'next'

const AddCustomerPortalPage: NextLayoutComponentType = () => {
  return (
    <Wrapper title="Add New Customer">
      <AddCustomer />
    </Wrapper>
  )
}

AddCustomerPortalPage.getLayout = function getLayout(page) {
  return <MainLayout children={page} />
}

export default AddCustomerPortalPage
