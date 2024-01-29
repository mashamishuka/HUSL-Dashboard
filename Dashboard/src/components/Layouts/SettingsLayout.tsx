import { useEffect, useState } from 'react'
import { useWindowSize } from 'react-use'

import { Navbar, SettingsSidebar } from '@components/Navigation'

// import { Navbar } from '@components/Navigation/Navbar'

export const SettingsLayout: React.FC = ({ children }) => {
  const { width } = useWindowSize()

  const [margin, setMargin] = useState<number | string>('16.666667%')

  useEffect(() => {
    const sidebar = document.getElementById('SETTINGS_SIDEBAR')
    if (sidebar) {
      setMargin(sidebar?.clientWidth)
    }
  }, [width])

  return (
    <div
      style={{
        paddingLeft: margin
      }}>
      <SettingsSidebar className="hidden md:block" />
      <main className="relative min-h-screen px-5 pt-32 md:pb-5 pb-14">
        <Navbar margin={margin + 'px'} type="settings" />
        {children}
      </main>
    </div>
  )
}
