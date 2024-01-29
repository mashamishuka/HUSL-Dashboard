import Image from 'next/image'
import Link from 'next/link'
import type { NextLayoutComponentType } from 'next'
import { AdminLoginForm } from '@components/Forms'

const AdminAuthPage: NextLayoutComponentType = () => {
  return (
    <div className="flex items-center justify-center h-screen mx-auto text-center lg:w-1/2 xl:w-1/3">
      <div className="flex flex-col flex-1 space-y-5 rounded-lg">
        <Link href="/">
          <a>
            <Image src="/static/icons/logo.png" width={120} height={50} className="object-contain" />
          </a>
        </Link>
        <AdminLoginForm />
      </div>
    </div>
  )
}

export default AdminAuthPage
