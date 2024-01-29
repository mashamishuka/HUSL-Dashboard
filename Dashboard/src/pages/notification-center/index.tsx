import { useRef, useState } from 'react'
import { Loading } from '@components/Icons'
import { MainLayout } from '@components/Layouts/MainLayout'
import { Wrapper } from '@components/Layouts/Wrapper'
import { useWebSocket } from '@hooks/useWebsocket'
import { NextLayoutComponentType } from 'next'
import { MdOutlineNotificationAdd } from 'react-icons/md'
import { NotifyModal } from '@components/Modals/NotifyModal'
import { NotifyUserForm } from '@components/Forms/NotifyUser'
import { NotificationListTable } from '@components/DataTables/NotificationList'

const NotificationCenterPage: NextLayoutComponentType = () => {
  const [isLoading] = useState(false)
  const [notifyModal, setNotifyModal] = useState(false)
  const { socket } = useWebSocket()
  const buttonRef = useRef<HTMLButtonElement>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-80">
        <Loading />
      </div>
    )
  }
  const handleNotification = (data: any) => {
    socket?.emit('message', data)
  }
  return (
    <div>
      <Wrapper
        title="Notifications"
        actionEl={
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={() => setNotifyModal(true)}
              className="flex items-center px-5 py-2 space-x-2 text-sm border border-white rounded-lg">
              <MdOutlineNotificationAdd />
              <span>Add notification</span>
            </button>
          </div>
        }>
        <NotificationListTable notifyModal={notifyModal} />
      </Wrapper>
      <NotifyModal
        show={notifyModal}
        onClose={() => setNotifyModal(false)}
        width="36rem"
        center
        minHeight="36rem"
        nonInnerWidth>
        <p className="mb-3">Send a notification!</p>
        <NotifyUserForm onClose={() => setNotifyModal(false)} onSubmit={handleNotification} />
      </NotifyModal>
    </div>
  )
}

NotificationCenterPage.getLayout = function getLayout(page) {
  return <MainLayout children={page} />
}
export default NotificationCenterPage
