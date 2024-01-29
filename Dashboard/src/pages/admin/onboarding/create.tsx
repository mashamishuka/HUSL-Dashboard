import { Wrapper } from '@components/Layouts/Wrapper'
import { AdminLayout } from '@components/Layouts/AdminLayout'
import type { NextLayoutComponentType } from 'next'
import Button from '@components/Button'
import { MdChevronLeft } from 'react-icons/md'
import { CreateOnboardingItemForm } from '@components/Forms/admin/CreateOnboarding'
const AdminAccountPage: NextLayoutComponentType = () => {
  return (
    <div className="flex flex-col space-y-5">
      <div className="flex">
        <Button url="/admin/onboarding" className="flex items-center px-0 py-0 space-x-2" variant="none">
          <MdChevronLeft />
          <span>Back to onboarding list</span>
        </Button>
      </div>
      <Wrapper title="Create New Onboarding Item">
        <CreateOnboardingItemForm />
      </Wrapper>
    </div>
  )
}

AdminAccountPage.getLayout = function getLayout(page) {
  return <AdminLayout children={page} />
}

export default AdminAccountPage
