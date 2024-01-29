import clsx from 'clsx'
import Link from 'next/link'
import { Fragment, useCallback, useMemo } from 'react'
import { FiExternalLink } from 'react-icons/fi'
import { MdCategory, MdChat, MdChevronLeft, MdLeaderboard, MdPublic, MdOutlineNotificationsActive } from 'react-icons/md'
import { useLocation } from 'react-use'

import * as Icon from '@components/Icons'
import { Disclosure, Transition } from '@headlessui/react'
import { useMe } from '@hooks/useMe'
import { addHttp } from '@utils/index'

export interface NavigationListProps {
  layout?: 'compact' | 'full'
}

export const NavigationList: React.FC<NavigationListProps> = () => {
  const { data: user } = useMe()
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

  const marketingChilds = useMemo(() => {
    const childs = [
      {
        path: '/marketing/fb-ads',
        label: 'Meta Ads'
      },
      {
        path: '/marketing/social',
        label: 'Social Logins'
      },
      {
        path: '/marketing/graphics',
        label: 'Marketing Graphics'
      },
      {
        path: '/marketing/seo-docs',
        label: 'SEO Documents'
      },
      {
        path: '/marketing/email',
        label: 'Email'
      },
      {
        path: '/blog',
        label: 'Blog'
      }
    ]
    if (user?.data?.business && user?.data?.business?.length > 0) {
      childs.push({
        path: '/marketing/ad-material',
        label: 'Ad Materials'
      })
    }
    return childs
  }, [user])

  const items = useMemo(() => {
    // if (!user?.user?.userType) return []
    return [
      {
        path: '/',
        label: 'Overview',
        icon: Icon.GridView,
        childs: [
          // {
          //   path: '/overview',
          //   label: 'Overview'
          // },
          {
            path: '/overview/marketing-kpi',
            label: 'Meta Stats',
            onClick: null,
            external: false
          },
          {
            path: '/overview/customer-kpi',
            label: 'Customers KPI'
          },
          {
            path: '/overview/revenue',
            label: 'Revenue Stats'
          },
          {
            path: '/overview/website-stats',
            label: 'Website Stats'
          }
        ]
      },
      {
        path: '/access-manager',
        label: 'Access Manager',
        icon: Icon.ManageAccount
      },
      {
        path: '/roadmap',
        label: 'Brand Overview',
        icon: Icon.ForkLeft
      },
      {
        path: '#!',
        label: 'Marketing',
        icon: Icon.AccountTree,
        childs: marketingChilds
      },
      {
        path: '#!',
        label: 'Website',
        icon: MdPublic,
        childs: [
          {
            path: user?.data?.business?.[0]?.domain ? addHttp(user?.data?.business?.[0]?.domain) : '#!',
            external: true,
            label: 'View Website',
            icon: MdPublic
          },
          {
            path: user?.data?.productUrl ? addHttp(user?.data?.productUrl) : '#!',
            label: 'Product URL',
            icon: MdCategory,
            external: true
          }
          // {
          //   path: '#!',
          //   onClick: () => {
          //     user?.data?.websiteKey ? window.open(huslWebEditorPublicUrl(user?.data?.websiteKey), '_blank') : null
          //   },
          //   external: true,
          //   label: 'Website Editor',
          //   icon: MdPublic
          // }
        ]
      },
      {
        path: '/leaderboard',
        label: 'Leaderboard',
        icon: MdLeaderboard
      },
      {
        path: '/outreach-center',
        label: 'Outreach Center',
        icon: MdChat
      },
      {
        path: '/notification-center',
        label: 'Notification Center',
        icon: MdOutlineNotificationsActive
      }
      /*
      {
        id: 7,
        path: '/rewards',
        label: 'FC Rewards',
        icon: MdMoney,
      }*/
      // {
      //   id: 5,
      //   path: '/customer-portal',
      //   label: 'Customer Portal',
      //   icon: Icon.Article
      // },
      // {
      //   id: 6,
      //   path: '/partnership',
      //   label: 'Partnerships',
      //   icon: Icon.Handshake
      // }
    ].filter(Boolean)
  }, [user, marketingChilds])

  if (user?.data?.nftId[0] === '-') {
    return null
  }

  return (
    <ul className="flex flex-col px-0 py-0 space-y-7">
      {items?.map((item, i) => (
        <Fragment key={i}>
          {!item?.childs?.length && (
            <li>
              <Link href={item?.path}>
                <a
                  className={clsx(
                    'flex md:px-6 space-x-3 rounded-xl transition-all items-center',
                    item.path === '/' && pathname === '/' && 'text-primary',
                    item.path !== '/' && isActivePath(item.path, pathname) && 'text-primary'
                  )}
                  target={(item as any)?.external ? '_blank' : '_self'}>
                  <span>
                    <item.icon fill="currentColor" size={18} />
                  </span>
                  <span>{item?.label}</span>
                  {/* {item?.external && <FiExternalLink size={10} className="ml-2" />} */}
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
                    className="flex flex-col mb-3 space-y-2 mt-7 ml-14"
                    show={open}>
                    {item?.childs?.map((child, i) => (
                      <div key={i}>
                        {(child as any)?.onClick ? (
                          <button
                            onClick={(child as any)?.onClick}
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
      ))}
    </ul>
  )
}
