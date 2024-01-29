import { Wrapper } from '@components/Layouts/Wrapper'
import type { NextLayoutComponentType } from 'next'
import { AdminLayout } from '@components/Layouts/AdminLayout'
import { PayoutListTable } from '@components/DataTables/PayoutList'
import Web3 from 'web3'
import ABI_STAKING from '@shared/jsons/abi_staking.json'
import ABI_ERC20 from '@shared/jsons/abi_erc20.json'
import TransactionDialog from './components/TransactionDialog'
import { useState } from 'react'
import { ADDRESS_CONTRACT, ADDRESS_STAKING } from '@consts/addresses'

const TOKEN_DECIMALS = 18

async function init_web3() {
  const provider = window.ethereum
  const web3 = new Web3(provider)
  const network_id = await web3.eth.net.getId()
  if (network_id !== 1) {
    const error_message = `Please switch to Ethereum network in your Metamask wallet (you are on network #${network_id}).`
    alert(error_message)
    throw new Error(error_message)
  }

  const address = await provider.request({ method: 'eth_requestAccounts' }).then(async (accounts: string[]) => accounts[0])
  return { web3, address }
}

const AdminAccountPage: NextLayoutComponentType = () => {
  const [is_depositing, set_is_depositing] = useState(false)
  const [usd, set_usd] = useState(0)
  const amount = usd + '0'.repeat(TOKEN_DECIMALS)

  const transactions = [
    {
      title: 'Approve USDH',
      action: async () => {
        const { address, web3 } = await init_web3()
        const contract_usdh = new web3.eth.Contract(ABI_ERC20 as any[], ADDRESS_CONTRACT)
        const contract_staking = new web3.eth.Contract(ABI_STAKING as any[], ADDRESS_STAKING)

        const owner = await contract_staking.methods.contract_owner().call()
        if (address.toLowerCase() !== owner.toLowerCase()) {
          const error_message = `You (${address}) are not the owner (${owner}) of this smart contract.`
          alert(error_message)
          throw new Error('You are not the owner of this smart contract.')
        }
        await contract_usdh.methods.approve(ADDRESS_STAKING, amount).send({ from: address })
      }
    },
    {
      title: 'Deposit USDH',
      action: async () => {
        const { address, web3 } = await init_web3()
        const contract_staking = new web3.eth.Contract(ABI_STAKING as any[], ADDRESS_STAKING)
        await contract_staking.methods.deposit(amount).send({ from: address })
      }
    }
  ]

  return (
    <div className="flex flex-col space-y-5">
      <Wrapper title="Payout Overview" actionEl={<div className="relative flex items-center space-x-3"></div>}>
        <div className="max-w-full py-5 -mt-4 overflow-x-auto md:py-0 md:mt-0">
          <input
            className="px-3 py-2 mr-2 text-black bg-white border-none rounded-md focus:outline-none"
            type="number"
            onChange={(e) => set_usd(parseInt(e.target.value))}
            placeholder="Amount in USD"
          />
          <button onClick={() => set_is_depositing(true)} className="px-3 py-2 mb-5 text-black bg-white rounded-md">
            Deposit Rewards
          </button>
          <TransactionDialog
            title="Deposit Rewards"
            data={transactions}
            is_open={is_depositing}
            on_close={() => set_is_depositing(false)}
            on_completion={() => null}
          />
          <PayoutListTable />
        </div>
      </Wrapper>
    </div>
  )
}

AdminAccountPage.getLayout = function getLayout(page) {
  return <AdminLayout children={page} />
}

export default AdminAccountPage
