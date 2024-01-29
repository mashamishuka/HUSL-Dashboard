// import { useWallet } from '@hooks/useWallet'
import clsx from 'clsx'
import { signIn, signOut } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { MdAdminPanelSettings, MdChevronLeft, MdLogout, MdSettings, MdOutlineLocalGroceryStore } from 'react-icons/md'
import { useToggle } from 'react-use'

import { Avatar } from '@components/Avatar'
import { Dropdown } from '@components/Dropdowns'
import { Search } from '@components/Forms/components'
import { Logo } from '@components/Icons'
import { Transition } from '@headlessui/react'
import { useHeaderHeight } from '@hooks/useHeaderHeight'
import { useMe } from '@hooks/useMe'
import { cutString, fetchNftIdsFromAddress } from '@utils/index'
import { callbackAvatar } from '@utils/lib/callbackAvatar'
import { getUserData } from '@utils/lib/fetchBalance'

import { NavigationList as AdminNavigationList } from '../AdminSidebar/NavigationList'
// prettier-ignore
import {
  NavigationList as AdminSettingNavigationList
} from '../AdminUserConfigSidebar/NavigationList'
import { NavigationList as SettingNavigationList } from '../SettingsSidebar/NavigationList'
import { NavigationList } from '../Sidebar/NavigationList'
import { FaDiscord } from 'react-icons/fa'
import { AddDiscordUsername } from '@components/Modals/AddDiscordUsername'
import { toast } from 'react-toastify'
import { confirm } from '@components/ConfirmationBox'
import { getUserByNfts } from '@src/restapi/users/mutation'
import { User } from '@src/restapi/users/user'

interface NavbarProps {
  margin?: number | string
  type?: 'admin' | 'user' | 'settings' | 'admin-settings'
  showLogo?: boolean
}

const showBenefit = (user?: User) => {
  if (!user) return false
  const allowedNfts = ['12']
  const hadFC = user?.foundersCard
  const nftAccess = allowedNfts.includes(user?.nftId)
  return hadFC || nftAccess
}

export const Navbar: React.FC<NavbarProps> = ({ margin = '16.666667%', type = 'user' }) => {
  const router = useRouter()
  const { setHeaderHeight } = useHeaderHeight()
  const [mobileMenu, setMobileMenu] = useToggle(false)
  const { data: user } = useMe()
  const [balance, set_balance] = useState(undefined)
  const [address, set_address] = useState<string | null | undefined>(undefined)
  const [showDiscordModal, setShowDiscordModal] = useState(false)
  const [nfts, setNfts] = useState<Pick<User, '_id' | 'name' | 'nftId'>[]>([])

  useEffect(() => {
    const nftId = user?.data?.nftId
    if (nftId) {
      getUserData(nftId).then(({ balance, address }) => {
        set_balance(balance)
        set_address(address)
      })
    }
  }, [user])

  useEffect(() => {
    if (address) {
      fetchNftIdsFromAddress(address).then((nftIds) => {
        const nft = nftIds.map((nftId: any) => Number(nftId))
        getUserByNfts(nft).then(({ data }) => {
          setNfts(data)
        })
      })
    }
  }, [address])
  // const { address, balance, connectWallet } = useWallet()

  const navRef = useRef<HTMLElement>(null)

  const Navigation = useMemo(() => {
    switch (type) {
      case 'user':
        return NavigationList
      case 'admin':
        return AdminNavigationList
      case 'settings':
        return SettingNavigationList
      case 'admin-settings':
        return AdminSettingNavigationList
      default:
        return NavigationList
    }
  }, [type])

  const businessNfts = useMemo(() => {
    return nfts?.map((b) => ({
      label: b?.name,
      onClick: async () => {
        try {
          const confirmation = await confirm('Are you sure you want to sign in with this NFT?')
          if (!confirmation) return
          await signIn('user', {
            nftId: b?.nftId
          })
        } catch (error: any) {
          toast.error(error)
        }
      }
    }))
  }, [nfts])

  useEffect(() => {
    if (navRef?.current?.clientHeight) {
      setHeaderHeight(navRef.current.clientHeight)
    }
  }, [navRef])

  useEffect(() => {
    return () => {
      setMobileMenu(false)
    }
  }, [router])
  return (
    <nav
      id="MAIN_HEADER"
      ref={navRef}
      className="fixed top-0 left-0 z-50 flex items-center justify-between px-5 space-x-20 md:space-x-0 py-5 md:py-9 md:left-auto md:right-0 bg-[#181818] bg-opacity-95 backdrop-blur-sm"
      style={{
        width: `calc(100% - ${margin})`
      }}>
      <div className="text-primary md:hidden">
        <Link href="/">
          <a className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary">
            <Logo size={32} fill="#fff" />
          </a>
        </Link>
      </div>
      <div className="xl:w-[25%] hidden md:block ml-0">
        <Search />
      </div>
      <div className="flex items-center justify-end flex-1 space-x-3">
        <div className="hidden md:block">
          <a
            href="https://token.husl.xyz"
            className="flex items-center justify-center px-5 py-2 space-x-3 rounded-3xl bg-secondary"
            target="_blank">
            <Image src="/static/icons/hicon.png" width={28} height={28} className="object-contain" />
            {balance === undefined ? (
              <span>loading...</span>
            ) : balance === -1 ? (
              ''
            ) : (
              <span>{(balance / 1e18).toFixed(2)}</span>
            )}
            {address === undefined ? (
              <span>loading...</span>
            ) : address === null ? (
              ''
            ) : (
              <span>{address.substring(0, 5) + '...' + address.substring(39, 42)}</span>
            )}
            {/* <span>0</span> */}
          </a>
        </div>
        {user?.data?.foundersCard && (
          <Link href="https://market.husl.xyz">
            <a className="flex items-center justify-center px-5 space-x-3 text-2xl py-2.5 rounded-3xl bg-secondary text-primary">
              <MdOutlineLocalGroceryStore />
            </a>
          </Link>
        )}
        {showBenefit(user?.data) && (
          <Link href="/benefits">
            <a
              className="flex items-center justify-center h-12 border border-white rounded-full border-opacity-5"
              style={{ width: 100 }}>
              Benefits
            </a>
          </Link>
        )}

        {user?.data?.nftId[0] !== '-' ? (
          <Link href="/services">
            <a
              className="flex items-center justify-center h-12 border border-white rounded-full border-opacity-5"
              style={{ width: 100 }}>
              AutoPilot
            </a>
          </Link>
        ) : null}
        {businessNfts && businessNfts?.length > 0 && (
          <Dropdown
            buttonClass="flex items-center justify-center border border-white rounded-full border-opacity-5 no-newline"
            dropdownClass="z-[100] w-52 md:w-48"
            text={user?.data?.name}
            items={businessNfts}
          />
        )}
        {/* <button className="flex items-center justify-center w-12 h-12 border border-white rounded-full border-opacity-5">
          <Bell fill="#BA954F" />
        </button> */}
        {/* Business select */}
        <div>
          <Dropdown
            dropdownClass="z-[100] w-52 md:w-48"
            text={
              <div role="button" className="flex items-center justify-between space-x-3 md:justify-start">
                <div className="relative flex items-center space-x-2 text-lg font-light md:space-x-3">
                  <div className="w-10 md:w-12">
                    <Avatar
                      src={callbackAvatar(user?.data?.profilePicture?.url, user?.data?.name || user?.data?.email || '')}
                      size={48}
                      layout="responsive"
                    />
                  </div>
                  <span className="hidden md:block">{cutString(user?.data?.nftId.replace('-', 'FC #') || '', 4, 4)}</span>
                </div>
                <MdChevronLeft className="text-xl transform -rotate-90" />
              </div>
            }
            items={[
              {
                label: (
                  <div className="flex items-center space-x-2 transition-all">
                    <MdAdminPanelSettings />
                    <span>Admin</span>
                  </div>
                ),
                onClick: () => router.push('/admin'),
                hide: user?.data?.role !== 'admin'
              },
              {
                label: (
                  <div className="flex items-center space-x-2 transition-all">
                    <FaDiscord />
                    <span>Discord Username</span>
                  </div>
                ),
                onClick: () => setShowDiscordModal(true)
              },
              {
                label: (
                  <div className="flex items-center space-x-2 transition-all">
                    <MdSettings />
                    <span>Settings</span>
                  </div>
                ),
                onClick: () => router.push('/settings/profile'),
                hide: user?.data?.role !== 'admin'
              },
              {
                label: (
                  <div className="flex items-center space-x-2 transition-all">
                    <MdLogout />
                    <span>Logout</span>
                  </div>
                ),
                onClick: () =>
                  signOut({
                    callbackUrl: '/auth'
                  })
              }
              // {
              //   label: (
              //     <div onClick={connectWallet} className="flex items-center space-x-2 text-left transition-all">
              //       <MdLink />
              //       <span>Reconnect Wallet</span>
              //     </div>
              //   ),
              //   onClick: connectWallet
              // }
            ]}
          />
        </div>

        {/* mobile navigation list */}
        <div className="block md:hidden">
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className={clsx('hamburger hamburger--collapse flex text-white', mobileMenu && 'is-active')}
            type="button">
            <span className="hamburger-box">
              <span className="hamburger-inner"></span>
            </span>
          </button>
          <Transition
            show={mobileMenu}
            enter="transition-transform duration-150"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition-transform duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
            className="fixed right-0 z-50 w-3/4 rounded-tl-lg shadow-lg bg-dark top-20 bg-opacity-95 backdrop-blur-sm"
            style={{
              top: navRef?.current?.getBoundingClientRect().height ?? '76px',
              height: `calc(100vh - ${(navRef?.current?.getBoundingClientRect().height || 76) + 30}px)`
            }}>
            <div className="flex flex-col justify-center px-6 space-y-8 mt-7">
              <Search />
              <Navigation />
            </div>
            {/* <span className="absolute bottom-0 right-0 px-6 py-3">Balance: 0</span> */}
          </Transition>
        </div>
      </div>
      <AddDiscordUsername show={showDiscordModal} onClose={() => setShowDiscordModal(false)} />
    </nav>
  )
}
