import { Wrapper } from '@components/Layouts/Wrapper'
import { AdminLayout } from '@components/Layouts/AdminLayout'
import { Toggler } from '@components/Forms/components'
import Button from '@components/Button'
import { useSetting } from '@hooks/useSetting'
import { toast } from 'react-toastify'
import { updateSetting } from '@src/restapi/setting/mutation'
import { useToggle } from 'react-use'
import { Onboarding } from '@components/Onboarding'

import type { NextLayoutComponentType } from 'next'
import { useOnboarding } from '@hooks/useOnboarding'

const AdminAccountPage: NextLayoutComponentType = () => {
  const { data: onboardings, mutate } = useOnboarding()
  const [updateLoading, setUpdateLoading] = useToggle(false)
  const { value: onboardingActive, state } = useSetting('show-onboarding')

  const handleToggleOnboardingStatus = async (active?: boolean) => {
    if (state === 'loading') return
    setUpdateLoading(true)
    try {
      await updateSetting('show-onboarding', {
        value: active
      })
    } catch (_) {
      toast.error('Something went wrong, please try again later.')
    } finally {
      setUpdateLoading(false)
    }
  }
  return (
    <div className="flex flex-col space-y-5">
      <Wrapper
        title="Onboarding Items"
        actionEl={
          <div className="flex items-center space-x-2">
            <span>Activate</span>
            <Toggler defaultChecked={!!onboardingActive} onSwitch={handleToggleOnboardingStatus} disabled={updateLoading} />
          </div>
        }>
        <div className="flex flex-col space-y-3">
          {onboardings && <Onboarding onboardings={onboardings?.data} onDrop={() => mutate?.()} />}
        </div>
        <div className="flex mt-5">
          <Button url="/admin/onboarding/create">Create New</Button>
        </div>
      </Wrapper>
    </div>
  )
}

AdminAccountPage.getLayout = function getLayout(page) {
  return <AdminLayout children={page} />
}

export default AdminAccountPage
