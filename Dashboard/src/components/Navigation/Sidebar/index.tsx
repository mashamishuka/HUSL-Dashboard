import clsx from 'clsx'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRef, useMemo } from 'react'

import { NavigationListProps } from './NavigationList'
import Image from 'next/image'
import Button from '@components/Button'
import { useSetting } from '@hooks/useSetting'
import { useActiveBusiness } from '@hooks/useActiveBusiness'
import { useBusiness } from '@hooks/useBusiness'
import { useRouter } from 'next/router'

const NavigationList = dynamic<NavigationListProps>(() => import('./NavigationList').then((mod) => mod.NavigationList), {
  ssr: false
})

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  className?: string
}

export const Sidebar: React.FC<SidebarProps> = ({ className, ...props }) => {
  const sidebarRef = useRef<HTMLElement>(null)
  const settings = useSetting('show-onboarding')
  const { business: activeBusiness } = useActiveBusiness()
  const { data: business } = useBusiness(activeBusiness?._id)
  const router = useRouter()

  const isOnboardingShow = useMemo(() => {
    if (!activeBusiness) return false
    if (business?.data?.onboardingCompleted) return false
    if (settings?.value) return true
    return false
  }, [business, router])

  return (
    <aside
      id="MAIN_SIDEBAR"
      ref={sidebarRef}
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
        {isOnboardingShow && <Button text="Start Here" className="mx-6 mb-5 text-base" size="sm" url="/onboarding" />}
        <NavigationList />
      </nav>
    </aside>
  )
}
