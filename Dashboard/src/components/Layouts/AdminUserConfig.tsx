import { useEffect, useState } from 'react'
import { useWindowSize } from 'react-use'

import { AdminUserConfigSidebar, Navbar } from '@components/Navigation'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { User } from 'next-auth'
import { FIND_ONE_USERS } from '@src/restapi/users/constants'
import { toast } from 'react-toastify'

// import { Navbar } from '@components/Navigation/Navbar'

export const AdminUserConfigLayout: React.FC = ({ children }) => {
  const { width } = useWindowSize()
  const { query } = useRouter()

  const { data } = useSWR<RestApi.Response<User['user']>>(FIND_ONE_USERS + query.userId)

  const [margin, setMargin] = useState<number | string>('16.666667%')

  useEffect(() => {
    const sidebar = document.getElementById('SETTINGS_SIDEBAR')
    if (sidebar) {
      setMargin(sidebar?.clientWidth)
    }
  }, [width])

  useEffect(() => {
    if (data) {
      toast.info(`You are editing ${data?.data?.name}'s account.`, {
        toastId: 'EDITING_USER',
        position: 'bottom-right',
        autoClose: false,
        draggable: true
      })
    }
    return () => {
      toast.dismiss('EDITING_USER')
    }
  }, [data])
  return (
    <div
      style={{
        paddingLeft: margin
      }}>
      <AdminUserConfigSidebar className="hidden md:block" />
      <main className="relative min-h-screen px-5 pt-32 md:pb-5 pb-14">
        <Navbar margin={margin + 'px'} type="admin-settings" />
        {children}
      </main>
    </div>
  )
}
