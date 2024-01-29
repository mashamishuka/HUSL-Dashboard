import { InfoRounded } from '@components/Icons'
import { PlainNavbar } from '@components/Navigation/Navbar/PlainNavbar'
import { useWallet } from '@hooks/useWallet'
import { cutString } from '@utils/index'

import type { NextLayoutComponentType } from 'next'

const AuthPage: NextLayoutComponentType = () => {
  const { connected, address } = useWallet()

  return (
    <div>
      <PlainNavbar />
      <div className="flex items-center justify-center h-screen text-center">
        <div className="flex flex-col items-center text-xl font-light md:space-x-2 md:flex-row">
          <div className="flex flex-row items-center space-x-2">
            <span className="pb-1 text-primary">
              <InfoRounded />
            </span>

            <span>{connected ? `Logged in as` : 'Connect your wallet to verify business ownership.'}</span>
          </div>
          {connected && (
            <>
              <span className="hidden md:block">{address}</span>
              <span className="block md:hidden" title={address || ''}>
                {cutString(address || '', 14, 14)}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthPage
