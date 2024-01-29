import { EditCustomer } from '@components/Forms/Customers'
import { MainLayout } from '@components/Layouts/MainLayout'
import { Wrapper } from '@components/Layouts/Wrapper'
import { fetcher } from '@services/fetcher'
import { GET_CUSTOMER_BY_ID } from '@src/restapi/customers/constants'
import { Customer } from '@src/restapi/customers/customers'

import type { NextApiRequest, NextLayoutComponentType } from 'next'

import useSWR, { SWRConfig } from 'swr'
import { Fallback } from 'swr/fallback'

interface EditCustomerPortalPageProps {
  customerId: string
}

export const getServerSideProps = async (req: NextApiRequest) => {
  const customerId = req?.query?.id?.toString() || ''
  const customerUrlKey = GET_CUSTOMER_BY_ID(customerId)
  const customerDetail = await fetcher(customerUrlKey)

  return {
    props: {
      customerId,
      fallback: {
        [customerUrlKey]: customerDetail
      }
    }
  }
}

const EditCustomerPortalPage: NextLayoutComponentType<EditCustomerPortalPageProps> = ({ customerId }) => {
  const { data } = useSWR<RestApi.Response<Customer>>(GET_CUSTOMER_BY_ID(customerId))

  return (
    <Wrapper title="Manage Customer">
      {data && <EditCustomer customerId={customerId} initialValues={{ ...data?.data }} />}
    </Wrapper>
  )
}

const _EditCustomerPortalPage: NextLayoutComponentType<EditCustomerPortalPageProps & Fallback> = ({
  fallback,
  customerId
}) => {
  return (
    <SWRConfig value={{ fallback }}>
      <EditCustomerPortalPage customerId={customerId} />
    </SWRConfig>
  )
}

_EditCustomerPortalPage.getLayout = function getLayout(page) {
  return <MainLayout children={page} />
}

export default _EditCustomerPortalPage
