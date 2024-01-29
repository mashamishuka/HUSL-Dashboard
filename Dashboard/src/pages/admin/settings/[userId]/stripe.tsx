import { Wrapper } from '@components/Layouts/Wrapper'

import { StripeConfigForm } from '@components/Forms/admin/StripeConfig'
import { AdminUserConfigLayout } from '@components/Layouts/AdminUserConfig'

import type { NextLayoutComponentType } from 'next'
import { MdChevronLeft } from 'react-icons/md'
import { useRouter } from 'next/router'

const StripeSettingsPage: NextLayoutComponentType = () => {
  const { push } = useRouter()
  return (
    <div>
      <button onClick={() => push('/admin/accounts')} className="flex items-center mb-3 space-x-2">
        <MdChevronLeft size={16} />
        <span>Back to Account List</span>
      </button>
      <Wrapper title="Stripe Integration Settings" className="flex flex-col space-y-5">
        <StripeConfigForm />
      </Wrapper>
    </div>
  )
}

StripeSettingsPage.getLayout = function getLayout(page) {
  return <AdminUserConfigLayout children={page} />
}

export default StripeSettingsPage
