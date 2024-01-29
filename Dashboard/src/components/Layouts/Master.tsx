import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { toast } from 'react-toastify'

export const MasterLayout: React.FC = ({ children }) => {
  const { pathname } = useRouter()
  const { data: session } = useSession()

  const handleDisconnectWallet = () => {
    if (pathname?.startsWith('/auth')) {
      toast.dismiss('wallet-disconnected')
      return
    }

    // show toast
    // toast.error('Session expired or not found, click here to reconnect.', {
    //   toastId: 'wallet-disconnected',
    //   autoClose: false,
    //   position: 'bottom-right',
    //   style: {
    //     fontSize: 14
    //   },
    //   closeOnClick: false,
    //   onClick: () => push('/auth')
    // })
  }
  useEffect(() => {
    if (!session?.jwt) {
      handleDisconnectWallet()
    }
  }, [session, pathname])

  return <>{children}</>
}
