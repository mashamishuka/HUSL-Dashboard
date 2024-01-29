import { Wrapper } from '@components/Layouts/Wrapper'
import { AdminLayout } from '@components/Layouts/AdminLayout'
import type { NextLayoutComponentType } from 'next'
import Button from '@components/Button'
import { MdChevronLeft } from 'react-icons/md'
import { EditOnboardingItemForm } from '@components/Forms/admin/EditOnboarding'

const AdminOnboardingEdit: NextLayoutComponentType = () => {
  return (
    <div className="flex flex-col space-y-5">
      <div className="flex">
        <Button url="/admin/onboarding" className="flex items-center px-0 py-0 space-x-2" variant="none">
          <MdChevronLeft />
          <span>Back to onboarding list</span>
        </Button>
      </div>
      <Wrapper title="Edit Onboarding Item">
        <EditOnboardingItemForm />
      </Wrapper>
    </div>
  )
}

AdminOnboardingEdit.getLayout = function getLayout(page) {
  return <AdminLayout children={page} />
}

export default AdminOnboardingEdit
