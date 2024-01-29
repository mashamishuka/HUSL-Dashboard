import { useSession } from 'next-auth/react'
import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import { GET_USERS } from '@src/restapi/users/constants'
import { User } from '@src/restapi/users/user'
import { DataTable } from '../CoreDatatable'
import { GET_ALL_INVOICES, GET_WHITELABELS } from '@src/restapi/finances/constants'
import { GET_ALL_PAYOUTS } from '@src/restapi/payouts/constants'
import { get_founder_cards, store_payout } from '@src/restapi/payouts/mutation'
import { MdPayment } from 'react-icons/md'
import Web3 from 'web3'
import { AbiItem } from 'web3-utils'
import ABI_ERC20 from '@shared/jsons/abi_erc20.json'
import { fetchAddress } from '@utils/lib/fetchBalance'
import calc_earnings_for_whitelabel from '@utils/calc_earnings_for_whitelabel'
import { ADDRESS_CONTRACT } from '@consts/addresses'

const LoadingScreen = () => {
  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 font-bold text-center text-white bg-black/90 z-[10000] pt-[45vh] text-[20px]">
      Waiting for transaction to complete.
      <br />
      Do not leave this page!
    </div>
  )
}

async function switch_to_network(web3: Web3, chain_id: number) {
  await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: web3.utils.toHex(chain_id) }]
  })
}

async function transfer_usdc(user_receiver: string, address_receiver: string, usdc_cents: number, set_is_loading: any) {
  const provider = window.ethereum
  if (provider) {
    const web3 = new Web3(provider)

    const correct_chain = await require_chain(web3, 1)
    if (!correct_chain) {
      alert('You are on the wrong network. Please switch to Ethereum mainnet.')
    }
    provider
      .request({ method: 'eth_requestAccounts' })
      .then(async (accounts: string[]) => {
        const address = accounts[0]
        const contract = new web3.eth.Contract(ABI_ERC20 as AbiItem[], ADDRESS_CONTRACT)
        const value = web3.utils.toWei((usdc_cents / 100).toString(), 'mwei')
        console.log(address, contract, usdc_cents, value)

        set_is_loading(true)

        const senderAddress = address
        const senderNonce = await web3.eth.getTransactionCount(senderAddress)
        const gasPrice = await web3.eth.getGasPrice()
        const gasLimit = 100000
        const tx = {
          from: senderAddress,
          to: ADDRESS_CONTRACT,
          nonce: senderNonce,
          gasPrice: gasPrice,
          gasLimit: gasLimit,
          data: contract.methods.transfer(address_receiver, value).encodeABI(),
          chainId: 1 // mainnet
        }
        const transaction = await web3.eth.sendTransaction(tx, (err, txHash) => {
          if (err) console.log(err)
          console.log('TransactionSent')
          console.log(txHash)
        })

        set_is_loading(false)

        store_payout(user_receiver, usdc_cents, transaction)
      })
      .catch((err: any) => {
        console.log('In transfer_usdc function. ', err)
        set_is_loading(false)
      })
  } else {
    alert('Please install Metamask. If you are on mobile, open this website in the browser of your Metamask app.')
  }
}

async function require_chain(web3: Web3, required_chain_id: number) {
  if ((await web3.eth.getChainId()) !== required_chain_id) {
    await switch_to_network(web3, required_chain_id)
    if ((await web3.eth.getChainId()) !== required_chain_id) {
      return false
    } else {
      return true
    }
  } else {
    return true
  }
}

function format_usd_amount(amount_in_cents: number | null | undefined) {
  return amount_in_cents ? '$' + (amount_in_cents / 100).toFixed(2) : null
}

export const PayoutListTable: React.FC = () => {
  const { data: session } = useSession()
  const { data: users, error } = useSWR<RestApi.Response<User[]>>(GET_USERS)

  const { data: invoices } = useSWR<RestApi.Response<any>>(
    `${GET_ALL_INVOICES}?user_id=6376998f81e5b441c135d219&unix_min=0&unix_max=2000000000`
  )
  const { data: whitelabels } = useSWR<RestApi.Response<any>>(GET_WHITELABELS)
  const { data: payouts } = useSWR<RestApi.Response<any>>(GET_ALL_PAYOUTS)
  const [is_loading, set_is_loading]: [boolean, any] = useState(false)
  const [amounts, set_amounts]: [any, any] = useState(null)
  function total_paidout_to_user(user_id: string) {
    if (payouts) {
      let total = 0
      for (let i = 0; i < payouts?.data.payouts.length; i++) {
        const { amount_paid, user } = payouts?.data.payouts[i]
        if (user === user_id) {
          total += amount_paid
        }
      }
      return total
    } else {
      null
    }
  }
  function get_timestamp_of_last_payout_to_user(user_id: string) {
    if (payouts) {
      const user_payouts = payouts?.data.payouts.filter(({ user }: { user: string }) => user === user_id)
      const user_payout_timestamps = user_payouts.map(({ created }: { created: number }) => created)
      return Math.max(0, ...user_payout_timestamps)
    } else {
      return 0
    }
  }
  useEffect(() => {
    if (users && payouts && invoices && whitelabels) {
      const new_amounts: any = {}
      const promises = users?.data
        ?.filter(({ nftId }: { nftId: string }) => parseInt(nftId) <= 10000)
        .map(async ({ _id: user_id, nftId }: { _id: string; nftId: string }) => {
          const last_payout_timestamp = get_timestamp_of_last_payout_to_user(user_id)
          const whitelabel: string | undefined = whitelabels.data.whitelabel_by_id[user_id]
          const { total_earnings, locked_earnings } = calc_earnings_for_whitelabel(
            invoices.data.invoices_in_time_period,
            last_payout_timestamp,
            whitelabel
          )
          const amount_due = (total_earnings || 0) - (locked_earnings || 0)

          let founder_cards: number | null = null

          if (amount_due > 0) {
            const cards = await get_founder_cards(nftId)

            if (cards?.length > 0) {
              founder_cards = cards.length
            }

            if (!cards) {
              console.log(`get_founder_cards(${nftId}) issue for user ID ${user_id}`)
            }
          }

          let payout_ratio = (founder_cards || 0) >= 15 ? 0.77 : 0.76
          // reduce husl fee to zero if fcs >= 25
          if ((founder_cards || 0) >= 25) payout_ratio = 1

          const paid_out = total_paidout_to_user(user_id) || 0
          new_amounts[user_id] = { amount_due, paid_out, locked_earnings, payout_ratio, founder_cards }
          console.log(new_amounts, '=====>new amounts')
        })
      Promise.all(promises).then(() => {
        set_amounts(new_amounts)
      })
    }
  }, [users, payouts, invoices, whitelabels])

  const data = useMemo(() => {
    if (!users) return []

    return users?.data
      ?.filter(({ nftId }: { nftId: string }) => parseInt(nftId) <= 10000 && nftId[0] !== '-')
      .map(({ _id, nftId, name }: { _id: string; nftId: string; name: string }) => {
        const amount_due_in_cents = amounts ? amounts[_id]?.amount_due * amounts[_id]?.payout_ratio : null
        const paid_out = amounts && amounts[_id] ? amounts[_id]?.paid_out : null
        const locked = amounts && amounts[_id] ? amounts[_id]?.locked_earnings : null
        const founder_cards = amounts && amounts[_id] ? amounts[_id]?.founder_cards : null

        return {
          id: _id,
          nftId: nftId,
          name: name || '',
          paid_out: format_usd_amount(paid_out) || '',
          amount_due: format_usd_amount(amount_due_in_cents),
          amount_due_in_cents: amount_due_in_cents,
          locked_earnings: format_usd_amount(locked) || '',
          founder_cards: founder_cards
        }
      })
  }, [users, amounts])

  async function pay(user_id: string, nft_id: number, amount_in_cents: number, set_is_loading: any) {
    const address_receiver = await fetchAddress(nft_id)
    const alertMessage =
      'paying ' +
      format_usd_amount(amount_in_cents) +
      ' to NFT #' +
      nft_id +
      ' / USER #' +
      user_id +
      ' (' +
      address_receiver +
      ')'
    alert(alertMessage)
    transfer_usdc(user_id, address_receiver, amount_in_cents, set_is_loading)
  }

  const columns = useMemo(() => {
    return [
      {
        Header: 'UserID',
        accessor: 'id',
        disableSortBy: true
      },
      {
        Header: 'NFT',
        accessor: 'nftId'
      },
      {
        Header: 'Name',
        accessor: 'name',
        disableSortBy: true
      },
      {
        Header: 'Founder Cards',
        accessor: 'founder_cards'
      },
      {
        Header: 'Paid out',
        accessor: 'paid_out'
      },
      {
        Header: 'Amount Due',
        accessor: 'amount_due'
      },
      {
        Header: 'Waiting',
        accessor: 'locked_earnings'
      },
      {
        Header: () => <p className="text-right">Action</p>,
        accessor: 'action',
        disableSortBy: true,
        Cell: (c: any) => {
          const cell_data = c.row.original
          const user_id = cell_data.id
          const nft_id = cell_data.nftId
          const amount_due = cell_data.amount_due_in_cents

          return (
            <div className="flex justify-end space-x-3 text-left">
              {c?.row?.original?.amount_due && (
                <button
                  onClick={() => pay(user_id, nft_id, Math.round(amount_due), set_is_loading)}
                  className="text-lg text-left underline text-primary"
                  title="Payout">
                  <MdPayment />
                </button>
              )}
            </div>
          )
        }
      }
    ]
  }, [session])

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        loading={!users && !error}
        showSearch
        searchOnHeader
        limitOptions={[5, 10, 15, 20]}
        totalData={0}
        initialState={{
          hiddenColumns: ['role']
        }}
      />
      {is_loading ? <LoadingScreen /> : null}
    </>
  )
}
