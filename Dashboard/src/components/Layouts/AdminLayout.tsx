import { useEffect, useState } from 'react'
import { useWindowSize } from 'react-use'

import { Navbar, AdminSidebar } from '@components/Navigation'

// import { Navbar } from '@components/Navigation/Navbar'

export const AdminLayout: React.FC = ({ children }) => {
  const { width } = useWindowSize()

  const [margin, setMargin] = useState<number | string>('16.666667%')

  useEffect(() => {
    const sidebar = document.getElementById('ADMIN_SIDEBAR')
    if (sidebar) {
      setMargin(sidebar?.clientWidth)
    }
  }, [width])

  return (
    <div
      style={{
        paddingLeft: margin
      }}>
      <AdminSidebar className="hidden md:block" />
      <main className="relative min-h-screen px-5 pt-32 md:pb-5 pb-14">
        <Navbar margin={margin + 'px'} type="admin" />
        {children}
      </main>
    </div>
  )
}
