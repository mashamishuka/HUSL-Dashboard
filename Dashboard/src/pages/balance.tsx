import Image from 'next/image'

import { PlainNavbar } from '@components/Navigation/Navbar/PlainNavbar'

import type { NextLayoutComponentType } from 'next'

const AuthPage: NextLayoutComponentType = () => {
  return (
    <div className="w-11/12 px-10 mx-auto">
      <PlainNavbar />
      <div className="flex flex-col items-center justify-center min-h-screen mt-20 space-y-10 text-center">
        <div className="flex flex-col items-center space-y-3 text-xl">
          <h1 className="font-bold text-7xl">$3,056.00</h1>
          <span className="text-3xl text-primary">$husl Balance</span>
        </div>
        <div className="w-full mt-20">
          <Image src="/static/images/husl_banner.png" layout="responsive" width={1240} height={400} />
        </div>
      </div>
    </div>
  )
}

export default AuthPage
