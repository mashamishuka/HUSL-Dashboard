import clsx from 'clsx'
import Link from 'next/link'
import { Fragment, useCallback, useMemo } from 'react'
import {
  MdAccountCircle,
  MdAnalytics,
  MdCategory,
  MdChevronLeft,
  MdDeviceHub,
  MdFeed,
  MdPayment,
  MdPublic
} from 'react-icons/md'
import { useLocation } from 'react-use'

import * as Icon from '@components/Icons'
import { Disclosure, Transition } from '@headlessui/react'
import { useRouter } from 'next/router'
import { FiExternalLink } from 'react-icons/fi'
import { useUser } from '@hooks/useUser'
import { addHttp, huslWebEditorPublicUrl } from '@utils/index'

export interface NavigationListProps {
  layout?: 'compact' | 'full'
}

export const NavigationList: React.FC<NavigationListProps> = () => {
  const { pathname } = useLocation()
  const { query } = useRouter()
  const { data: user } = useUser(query?.userId?.toString())

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
        path: `/admin/settings/${query?.userId}/profile`,
        label: 'Manage Profile',
        icon: MdAccountCircle
      },
      {
        id: 2,
        path: '#!',
        label: 'HUSL App',
        icon: MdDeviceHub,
        childs: [
          {
            path: `/admin/settings/${query?.userId}/husl-app/email`,
            label: 'HUSL Mail'
          },
          {
            path: '#!',
            onClick: () => {
              user?.data?.websiteKey ? window.open(huslWebEditorPublicUrl(user?.data?.websiteKey), '_blank') : null
            },
            external: true,
            label: 'Web HUSL',
            icon: MdPublic
          }
        ]
      },
      {
        id: 3,
        path: `/admin/settings/${query?.userId}/facebook`,
        label: 'Meta Ads',
        icon: Icon.Facebook
      },
      {
        id: 4,
        path: `/admin/settings/${query?.userId}/stripe`,
        label: 'Stripe',
        icon: MdPayment,
        hide: false
      },
      {
        id: 5,
        path: `/admin/settings/${query?.userId}/ga`,
        label: 'Google Analytics',
        icon: MdAnalytics
      },
      {
        id: 6,
        path: `/admin/settings/${query?.userId}/roadmap`,
        label: 'Roadmap',
        icon: MdFeed
      },
      {
        id: 7,
        path: user?.data?.productUrl ? addHttp(user?.data?.productUrl) : '#!',
        label: 'Product URL',
        icon: MdCategory,
        external: true
      }
    ]
  }, [user, query])
  return (
    <ul className="flex flex-col px-0 py-0 space-y-7">
      {items?.map((item, i) => (
        <Fragment key={i}>
          {item?.hide ? (
            <></>
          ) : (
            <Fragment>
              {!item?.childs?.length && (
                <li>
                  <Link href={item?.path}>
                    <a
                      className={clsx(
                        'flex md:px-6 space-x-3 rounded-xl transition-all items-center',
                        item.path === '/' && pathname === '/' && 'text-primary',
                        item.path !== '/' && isActivePath(item.path, pathname) && 'text-primary'
                      )}
                      target={item?.external ? '_blank' : '_self'}>
                      <span>
                        <item.icon fill="currentColor" size={18} />
                      </span>
                      <span>{item?.label}</span>
                    </a>
                  </Link>
                </li>
              )}
              {item?.childs?.length && (
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
                        {item?.childs?.map((child, i) => (
                          <div key={i}>
                            {child?.onClick ? (
                              <button
                                onClick={child?.onClick}
                                className={clsx(
                                  'px-3 py-2 rounded-md hover:bg-primary hover:text-white inline-flex',
                                  child.path === '/' && pathname === '/' && 'bg-primary',
                                  child.path !== '/' && isActivePath(child.path, pathname) && 'bg-primary'
                                )}>
                                {child?.label}
                                {child?.external && <FiExternalLink size={10} className="ml-2" />}
                              </button>
                            ) : (
                              <Link href={child?.path}>
                                <a
                                  className={clsx(
                                    'px-3 py-2 rounded-md hover:bg-primary hover:text-white inline-flex',
                                    child.path === '/' && pathname === '/' && 'bg-primary',
                                    child.path !== '/' && isActivePath(child.path, pathname) && 'bg-primary'
                                  )}>
                                  {child?.label}
                                  {child?.external && <FiExternalLink size={10} className="ml-2" />}
                                </a>
                              </Link>
                            )}
                          </div>
                        ))}
                      </Transition>
                    </li>
                  )}
                </Disclosure>
              )}
            </Fragment>
          )}
        </Fragment>
      ))}
    </ul>
  )
}
