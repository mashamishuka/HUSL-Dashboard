import Web3 from 'web3'
import { AbiItem } from 'web3-utils'
import { MainLayout } from '@components/Layouts/MainLayout'
import { Wrapper } from '@components/Layouts/Wrapper'
import { useMe } from '@hooks/useMe'

import type { NextLayoutComponentType } from 'next'
import { useEffect, useState } from 'react'
import ABI_STAKING from '@shared/jsons/abi_staking.json'
import ABI_ERC721 from '@shared/jsons/abi_erc721.json'
import ABI_FOUNDERSCARD from '@shared/jsons/abi_founderscard.json'
import { ADDRESS_FOUNDERSCARD, ADDRESS_STAKING } from '@consts/addresses'

const TOKEN_DECIMALS = 18

const WaitScreen = ({ title }: { title: string }) => {
  return (
    <div
      style={{
        backgroundColor: 'rgba(0,0,0,0.85)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999
      }}>
      <p style={{ color: '#FFF', marginTop: '40vh', textAlign: 'center', fontSize: 30 }}>{title}</p>
    </div>
  )
}

async function withdraw(foundercard: number) {
  const { web3 } = await init_web3()
  const address = await get_owner_of_founderscard(foundercard)
  const contract_staking = new web3.eth.Contract(ABI_STAKING as AbiItem[], ADDRESS_STAKING)
  await contract_staking.methods.withdraw(foundercard).send({ from: address })
}

async function stake(foundercard: number) {
  const { web3 } = await init_web3()
  const address = await get_owner_of_founderscard(foundercard)
  const contract_staking = new web3.eth.Contract(ABI_STAKING as AbiItem[], ADDRESS_STAKING)
  await contract_staking.methods.stake(foundercard).send({ from: address })
  window.location.reload()
}

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

async function withdraw_all() {
  const { web3, address } = await init_web3()
  const contract_staking = new web3.eth.Contract(ABI_STAKING as AbiItem[], ADDRESS_STAKING)
  await contract_staking.methods.withdraw_all().send({ from: address })
}

async function stake_all() {
  const { web3, address } = await init_web3()
  const contract_staking = new web3.eth.Contract(ABI_STAKING as AbiItem[], ADDRESS_STAKING)
  await contract_staking.methods.stake_all().send({ from: address })
}

const ProductHeader = ({ title, description }: { title: string; description: string }) => {
  return (
    <>
      <h1 style={{ fontSize: 26 }}>{title}</h1>
      <p style={{ fontWeight: 100, fontSize: 14, marginBottom: 20, marginTop: 5, opacity: 0.7, maxWidth: 600 }}>
        {description}
      </p>
    </>
  )
}

const Button = ({ children, onClick }: { children: any; onClick: () => void }) => {
  return (
    <button
      className="px-3 py-1 mr-2 text-center text-black bg-white rounded-md cursor-pointer bold "
      onClick={() => onClick()}>
      {children}
    </button>
  )
}

function format_usdh(in_cents: number) {
  return (in_cents / Math.pow(10, TOKEN_DECIMALS - 2) / 100).toFixed(2) + ' USDH'
}

const RewardsTableRow = ({
  foundercard,
  balance,
  is_staked,
  set_is_waiting
}: {
  foundercard: number
  balance: number
  is_staked: boolean
  set_is_waiting: (value: boolean) => void
}) => {
  async function on_withdraw_clicked() {
    set_is_waiting(true)
    try {
      await withdraw(foundercard)
    } finally {
      set_is_waiting(false)
    }
  }

  async function on_stake_clicked() {
    set_is_waiting(true)
    try {
      await stake(foundercard)
    } finally {
      set_is_waiting(false)
    }
  }

  return (
    <tr>
      <td style={{ paddingRight: 40 }}>#{foundercard}</td>
      <td style={{ paddingRight: 40 }}>{is_staked ? 'approved' : 'not approved'}</td>
      <td style={{ paddingRight: 40 }}>{is_staked ? null : <Button onClick={on_stake_clicked}>approve</Button>}</td>
      <td style={{ paddingRight: 40 }}>{is_staked ? format_usdh(balance) : ''}</td>
      {balance > 0 ? (
        <td>
          <Button onClick={on_withdraw_clicked}>withdraw</Button>
        </td>
      ) : null}
    </tr>
  )
}

const RewardsTable = ({ data, set_is_waiting }: { data: any[]; set_is_waiting: (value: boolean) => void }) => {
  return (
    <div style={{ margin: 20 }}>
      <table>
        <thead>
          <tr style={{ fontWeight: 700 }}>
            <td style={{ paddingRight: 40 }}>FC</td>
            <td style={{ paddingRight: 40 }}>Status</td>
            <td style={{ paddingRight: 40 }}></td>
            <td style={{ paddingRight: 40 }}>Balance</td>
            <td style={{ paddingRight: 40 }}>Withdraw</td>
          </tr>
        </thead>
        <tbody>
          {data.map((row: any, i: number) => (
            <RewardsTableRow
              key={i}
              is_staked={row.is_staked}
              foundercard={row.foundercard}
              balance={row.balance}
              set_is_waiting={set_is_waiting}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

async function get_owner_of_founderscard(token_id: number) {
  const { web3 } = await init_web3()
  const contract_founderscard = new web3.eth.Contract(ABI_ERC721 as AbiItem[], ADDRESS_FOUNDERSCARD)
  return await contract_founderscard.methods.ownerOf(token_id).call()
}

async function get_founderscards_by_owner(owner: string) {
  const { web3 } = await init_web3()
  const contract_founderscard = new web3.eth.Contract(ABI_FOUNDERSCARD as AbiItem[], ADDRESS_FOUNDERSCARD)
  return await contract_founderscard.methods.getIDsByOwner(owner).call()
}

const RewardsPage: NextLayoutComponentType = () => {
  const user = useMe()
  const [founder_cards, set_founder_cards] = useState<number[] | undefined>(undefined)
  const [owner, set_owner] = useState<string | undefined>(undefined)
  const [data, set_data] = useState<any[] | undefined>(undefined)
  const [is_waiting, set_is_waiting] = useState(false)

  useEffect(() => {
    const founders_card = user?.data?.data.foundersCard
    if (founders_card && !founder_cards) {
      try {
        get_owner_of_founderscard(parseInt(founders_card)).then(set_owner)
      } catch (error) {
        console.error(error)
      }
    }
  }, [user])

  useEffect(() => {
    if (owner) {
      get_founderscards_by_owner(owner).then(set_founder_cards)
    }
  }, [owner])

  async function fetch_balances(owner: string, founder_cards: number[]) {
    const { web3 } = await init_web3()
    const contract_staking = new web3.eth.Contract(ABI_STAKING as AbiItem[], ADDRESS_STAKING)
    const deposit_counter = await contract_staking.methods.deposit_count().call()
    return Promise.all(
      founder_cards.map(async (foundercard: number) => {
        const balance_string = await contract_staking.methods.get_balance(foundercard).call()
        const staker = await contract_staking.methods.get_staker(foundercard, deposit_counter).call()

        const is_staked = staker.toLowerCase() == owner.toLowerCase()
        const balance = parseInt(balance_string)
        return {
          foundercard,
          balance,
          is_staked
        }
      })
    )
  }

  useEffect(() => {
    if (founder_cards && owner) {
      fetch_balances(owner, founder_cards).then(set_data)
    }
  }, [founder_cards, owner])

  // prettier-ignore
  const total_balance = data
    ? data
      .map(({ balance }: { balance: number }) => balance)
      .reduce((partial_sum: number, to_add: number) => (partial_sum || 0) + to_add)
    : undefined

  async function on_withdraw_all_clicked() {
    set_is_waiting(true)
    try {
      await withdraw_all()
    } finally {
      set_is_waiting(false)
    }
  }

  async function on_stake_all_clicked() {
    set_is_waiting(true)
    try {
      await stake_all()
    } finally {
      set_is_waiting(false)
    }
  }

  return (
    <div className="flex flex-col space-y-5">
      <Wrapper title="">
        <ProductHeader
          title="Your FounderCard Benefits"
          description="As a HUSL FounderCard holder, you will receive a share of all customer subscriptions of all businesses in the HUSL ecosystem."
        />

        <div className="h-10"></div>

        <p className="mb-2">Total: {total_balance !== undefined ? format_usdh(total_balance) : 'loading ...'}</p>
        <Button onClick={on_stake_all_clicked}>approve all</Button>
        <Button onClick={on_withdraw_all_clicked}>withdraw all</Button>

        <div className="h-10"></div>

        {data ? <RewardsTable data={data} set_is_waiting={set_is_waiting} /> : null}
        {is_waiting ? <WaitScreen title="Waiting..." /> : null}
      </Wrapper>
    </div>
  )

  /**
   *
   */
}

RewardsPage.getLayout = function getLayout(page) {
  return <MainLayout children={page} />
}

export default RewardsPage
