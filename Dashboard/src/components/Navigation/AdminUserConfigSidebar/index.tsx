import clsx from 'clsx'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRef } from 'react'

import { Logo } from '@components/Icons'

import { NavigationListProps } from './NavigationList'

const NavigationList = dynamic<NavigationListProps>(() => import('./NavigationList').then((mod) => mod.NavigationList), {
  ssr: false
})

interface AdminUserConfigSidebarProps extends React.HTMLAttributes<HTMLElement> {
  className?: string
}

export const AdminUserConfigSidebar: React.FC<AdminUserConfigSidebarProps> = ({ className, ...props }) => {
  const settingSidebarRef = useRef<HTMLElement>(null)

  return (
    <aside
      id="SETTINGS_SIDEBAR"
      ref={settingSidebarRef}
      className={clsx(
        'fixed top-0 left-0 xl:w-[18%] lg:w-3/12  h-screen py-10 transition-all z-10 overflow-y-auto',
        className
      )}
      {...props}>
      <div className="px-5 sm:mb-5 md:mb-10 lg:mb-[5.75rem]">
        <Link href="/">
          <a className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary">
            <Logo size={32} fill="#fff" />
          </a>
        </Link>
      </div>
      <nav>
        <NavigationList />
      </nav>
    </aside>
  )
}
