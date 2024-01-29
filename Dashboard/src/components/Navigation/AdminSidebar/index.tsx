import clsx from 'clsx'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRef } from 'react'

import { NavigationListProps } from './NavigationList'
import Image from 'next/image'

const NavigationList = dynamic<NavigationListProps>(() => import('./NavigationList').then((mod) => mod.NavigationList), {
  ssr: false
})

interface AdminSidebarProps extends React.HTMLAttributes<HTMLElement> {
  className?: string
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ className, ...props }) => {
  const adminSidebarRef = useRef<HTMLElement>(null)

  return (
    <aside
      id="ADMIN_SIDEBAR"
      ref={adminSidebarRef}
      className={clsx(
        'fixed top-0 left-0 xl:w-[18%] lg:w-3/12  h-screen py-10 transition-all z-10 overflow-y-auto',
        className
      )}
      {...props}>
      <div className="px-5 sm:mb-5 md:mb-10 lg:mb-[5.75rem]">
        <Link href="/">
          <a className="inline-flex items-center justify-center w-12 h-12">
            <Image src="/static/icons/hicon.png" width={48} height={48} className="object-contain" />
          </a>
        </Link>
      </div>
      <nav>
        <NavigationList />
      </nav>
    </aside>
  )
}
