import Image from 'next/image'

import { Dropdown } from '@components/Dropdowns'

import Button from './'
import { connectWallet } from '@services/wallet'
import axios from 'axios'
// import { useWallet } from '@hooks/useWallet'
// import { toast } from 'react-toastify'
// import { useRouter } from 'next/router'
const V2_URL = process.env.V2_URL

async function signIn() {
  await connectWallet()
  // get session data
  const data = await axios.get('/api/auth/session').then(({ data }) => data)
  if (data?.jwt) {
    window.location.href = `${V2_URL}/auth?token=${data?.jwt}`
  }
  // redirect to v2
  // if (result?.error) {
  //   alert('Error: ' + result?.error)
  // }
  // if (result?.url !== null && result?.url !== undefined) {
  //   window.location.href = result?.url
  // } else {
  //   window.location.href = '/'
  // }
}

export const ConnectWallet: React.FC = () => {
  // const { connected, connectWallet } = useWallet()
  // const router = useRouter()

  // const handleConnectWallet = async () => {
  //   const connection = await connectWallet()
  //   if (connection?.ok) {
  //     toast.success('Wallet connected successfully.')
  //     router.push('/')
  //   } else {
  //     toast.error('Wallet connection failed.')
  //   }
  // }
  const connected = false
  if (connected) {
    return (
      <Dropdown
        dropdownClass="w-60 top-14"
        text={
          <Button
            className="flex items-center px-5 py-4 space-x-3 text-xl transition-all hover:bg-primary"
            variant="outline"
            rounded="xl">
            <Image src="/static/icons/metamask_logo.svg" width={25} height={25} />
            <span>Connected</span>
          </Button>
        }
      />
    )
  } else {
    return (
      <Button
        // onClick={handleConnectWallet}
        className="flex items-center px-5 py-4 space-x-3 text-xl transition-all hover:bg-primary"
        variant="outline"
        rounded="xl"
        onClick={signIn}>
        <Image src="/static/icons/metamask_logo.svg" width={25} height={25} />
        <span>Connect Wallet</span>
      </Button>
    )
  }
}
