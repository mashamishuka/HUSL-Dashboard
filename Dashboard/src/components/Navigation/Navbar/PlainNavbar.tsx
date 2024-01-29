import Image from 'next/image'
import Link from 'next/link'

import { ConnectWallet } from '@components/Button/ConnectWallet'

export const PlainNavbar: React.FC = () => {
  return (
    <nav className="fixed top-0 flex justify-between w-11/12 py-6 -translate-x-1/2 md:px-10 md:py-14 left-1/2">
      <Link href="/">
        <a>
          <Image src="/static/icons/logo.png" width={120} height={50} className="object-contain" />
        </a>
      </Link>
      <ConnectWallet />
    </nav>
  )
}
