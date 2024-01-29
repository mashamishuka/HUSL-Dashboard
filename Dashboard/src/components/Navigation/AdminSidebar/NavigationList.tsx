import clsx from 'clsx'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Fragment, useCallback, useMemo } from 'react'
import {
  MdBusiness,
  MdChevronLeft,
  MdCreditCard,
  MdHome,
  MdImage,
  MdLeaderboard,
  MdSettings,
  MdSettingsSuggest
} from 'react-icons/md'
import { useLocation } from 'react-use'

import { Disclosure, Transition } from '@headlessui/react'

export interface NavigationListProps {
  layout?: 'compact' | 'full'
}

export const NavigationList: React.FC<NavigationListProps> = () => {
  const { data: session } = useSession()
  const { pathname } = useLocation()

  const isActivePath = useCallback(
    (current?: string, path?: string) => {
      if (!current || !path) return
      const paths = path?.split('/')?.filter(String)
      // check if path is multiple
      if (paths.length > 1) {
        return ('/' + paths?.join('/')?.toLowerCase() + '/').startsWith(current?.toLowerCase() + '/')
      }
      return path == current
    },
    [pathname]
  )

  const items = useMemo(() => {
    // if (!session?.user?.userType) return []
    return [
      {
        id: 1,
        path: '/admin',
        label: 'Dashboard',
        icon: MdHome,
        childs: []
      },
      {
        id: 2,
        path: '/admin/payouts',
        label: 'Payouts List',
        icon: MdCreditCard,
        childs: []
      },
      {
        id: 3,
        path: '#!',
        label: 'Settings',
        icon: MdSettings,
        childs: [
          {
            path: '/settings/profile',
            label: 'Profile'
          },
          {
            path: '/admin/settings/ga-config',
            label: 'Google Analytics'
          },
          {
            path: '/admin/settings/fb-config',
            label: 'Meta Ads'
          }
        ]
      },
      {
        id: 4,
        path: '/admin/generator',
        label: 'Generators',
        icon: MdImage,
        childs: [
          {
            path: '/admin/generator/graphics',
            label: 'Graphics'
          },
          {
            path: '/admin/generator/courses',
            label: 'Courses'
          },
          {
            path: '#!',
            label: 'Video'
          }
        ]
      },
      {
        id: 5,
        path: '#!',
        label: 'Business Builder',
        icon: MdBusiness,
        childs: [
          {
            path: '/admin/builder/product',
            label: 'Product'
          },
          {
            path: '/admin/builder/niche',
            label: 'Niche'
          },
          {
            path: '/admin/builder/business',
            label: 'Business'
          }
        ]
      },
      {
        id: 6,
        path: '/admin/onboarding',
        label: 'Onboarding',
        icon: MdSettingsSuggest,
        childs: []
      },
      {
        path: '/admin/leaderboard',
        label: 'Leaderboard',
        icon: MdLeaderboard,
        childs: []
      }
    ]
  }, [session])
  return (
    <ul className="flex flex-col px-0 py-0 space-y-7">
      {items?.map((item, i) => (
        <Fragment key={i}>
          {item?.childs?.length === 0 && (
            <li>
              <Link href={item?.path}>
                <a
                  className={clsx(
                    'flex md:px-6 space-x-3 rounded-xl transition-all items-center',
                    item.path === '/' && pathname === '/' && 'text-primary',
                    item.path !== '/' && isActivePath(item.path, pathname) && 'text-primary'
                  )}>
                  <span>
                    <item.icon fill="currentColor" size={18} />
                  </span>
                  <span>{item?.label}</span>
                </a>
              </Link>
            </li>
          )}
          {item?.childs && item?.childs?.length > 0 && (
            <Disclosure>
              {({ open }) => (
                <li>
                  <Disclosure.Button
                    className={clsx(
                      'flex md:px-6 space-x-3 rounded-xl transition-all items-center justify-between w-full',
                      item.path === '/' && pathname === '/' && 'text-primary',
                      item.path !== '/' && isActivePath(item.path, pathname) && 'text-primary'
                    )}>
                    <div className="flex items-center space-x-3">
                      <span>
                        <item.icon fill="currentColor" size={18} />
                      </span>
                      <span>{item?.label}</span>
                    </div>
                    <MdChevronLeft
                      className={clsx('text-2xl transform transition-transform', open ? 'rotate-90' : '-rotate-90')}
                    />
                  </Disclosure.Button>

                  <Transition
                    enter="transition duration-100 ease-out"
                    enterFrom="transform scale-95 opacity-0"
                    enterTo="transform scale-100 opacity-100"
                    leave="transition duration-75 ease-out"
                    leaveFrom="transform scale-100 opacity-100"
                    leaveTo="transform scale-95 opacity-0"
                    className="flex flex-col mb-3 space-y-2 mt-7 ml-14">
                    {item?.childs?.map((child: any, i) => (
                      <div key={i}>
                        <Link href={child?.path}>
                          <a
                            className={clsx(
                              'px-3 py-2 rounded-md hover:bg-primary hover:text-white inline-flex',
                              child.path === '/' && pathname === '/' && 'bg-primary',
                              child.path !== '/' && isActivePath(child.path, pathname) && 'bg-primary'
                            )}>
                            {child?.label}
                          </a>
                        </Link>
                      </div>
                    ))}
                  </Transition>
                </li>
              )}
            </Disclosure>
          )}
        </Fragment>
      ))}
    </ul>
  )
}
