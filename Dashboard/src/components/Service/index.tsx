// import { bool } from 'aws-sdk/clients/redshiftdata'
import { useEffect, useRef, useState } from 'react'
import { MdAdd } from 'react-icons/md'
import { useSearchParam } from 'react-use'
import Web3 from 'web3'
import { AbiItem } from 'web3-utils'

import { AddAccountCompact } from '@components/Forms'
import { CompactModal } from '@components/Modals'
// import { useMe } from '@hooks/useMe'
import { usePurchases } from '@hooks/usePurchases'
import ABI_ERC20 from '@shared/jsons/abi_erc20.json'
import { addTransactionHashToPurchase, createSubscription, updatePurchase } from '@src/restapi/purchases/mutation'
import { useSubscriptionStatus } from '@hooks/useSubscriptionStatus'
import { ADDRESS_CONTRACT, ADDRESS_RECEIVER } from '@consts/addresses'

const CENTS_PER_USD = 100

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

async function subscribeViaStripe(message: string, amount_in_usd: number, data: Record<string, any>) {
  const response: any = await createSubscription(message, amount_in_usd * CENTS_PER_USD, true, data)
  window.open(response.subscription_session.url)
}

async function purchaseViaUSDH(
  message: string,
  amount_transfer: number,
  amount_approve = 0,
  data: Record<string, any>,
  set_is_waiting: any
) {
  const result: any = await createSubscription(message, amount_transfer * CENTS_PER_USD, false, data)
  const purchaseId = result.purchase_id
  const provider = window.ethereum
  const web3 = new Web3(provider)
  const network_id = await web3.eth.net.getId()
  if (network_id !== 1) {
    alert('Please switch to Ethereum network in your Metamask wallet.')
    return
  }

  provider.request({ method: 'eth_requestAccounts' }).then(async (accounts: string[]) => {
    const address = accounts[0]
    const contract_usdh = new web3.eth.Contract(ABI_ERC20 as AbiItem[], ADDRESS_CONTRACT)

    //let balance_usdh = await contract_usdh.methods.balanceOf(address).call();

    const amount_transfer_erc20: string = amount_transfer + '000000000000000000'
    set_is_waiting(true)
    const transaction = await contract_usdh.methods.transfer(ADDRESS_RECEIVER, amount_transfer_erc20).send({ from: address })
    const transactionHash = transaction.transactionHash
    set_is_waiting(false)

    await addTransactionHashToPurchase(purchaseId, transactionHash)

    if (amount_approve > 0) {
      alert(
        'You have now paid for the first month. To allow for renewal of your subscription, please approve more USDH to be spent over the coming months.'
      )
      const amount_approve_erc20: string = amount_approve + '000000000000000000'
      set_is_waiting(true)
      await contract_usdh.methods.approve(ADDRESS_RECEIVER, amount_approve_erc20).send({ from: address })
      set_is_waiting(false)
    }
  })
}

function capitilize_first_letter(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function pad_to_two_digits(n: number) {
  return n < 10 ? '0' + n : n
}

function unix_to_readable(unix_timestamp: number) {
  const d = new Date(unix_timestamp * 1000)
  const dateString = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate()
  const timeString = pad_to_two_digits(d.getHours()) + ':' + pad_to_two_digits(d.getMinutes())
  return dateString + ' - ' + timeString
}

const PurchaseRow = ({ purchase }: { purchase: any }) => {
  const { _id, created, state, price, is_stripe_not_usdh, name } = purchase
  const { quantity, repetition } = purchase.data || { quantity: undefined, repetition: undefined }
  const subscription_status =
    name === 'subscription' && state === 'completed'
      ? useSubscriptionStatus(_id)
      : { data: { data: { subscription_status: '' } } }

  return (
    <tr style={state === 'aborted' ? { opacity: 0.3 } : {}}>
      <td style={{ paddingRight: 20 }}>{created > 0 ? unix_to_readable(created) : ''}</td>
      <td style={{ paddingRight: 20 }}>{purchase?.name === 'flatrate' ? 'Guaranteed Customers' : 'Organic Growth'}</td>
      <td style={{ paddingRight: 20 }}>{quantity !== undefined ? quantity + 'x ' + (repetition || '') : null}</td>
      <td style={{ paddingRight: 20 }}>${((price * quantity) / 100).toFixed(2)}</td>
      <td style={{ paddingRight: 20 }}>{is_stripe_not_usdh ? 'Stripe' : 'USDH'}</td>
      <td style={{ paddingRight: 20 }}>
        {subscription_status?.data?.data?.subscription_status === 'active' ? (
          <div className="bg-[#0F8] rounded-xl w-[12px] h-[12px] align-middle inline-block mr-1"></div>
        ) : null}
        {name === 'subscription' && state === 'completed'
          ? subscription_status?.data?.data?.subscription_status
          : state || '-'}
      </td>
      <td style={{ paddingRight: 20, opacity: 0.3 }}>{capitilize_first_letter(purchase?._id)}</td>
      {state === 'pending' ? (
        <td>
          <button
            className="px-3 py-1 text-center text-black bg-white rounded-md cursor-pointer bold"
            onClick={() =>
              updatePurchase(_id).then(() => {
                window.location.reload()
              })
            }>
            update
          </button>
        </td>
      ) : (
        <></>
      )}
      <td style={{ paddingRight: 20 }}>{purchase?.note || ''}</td>
    </tr>
  )
}

const PurchaseTable = ({ purchases }: { purchases: any }) => {
  return (
    <div style={{ margin: 20 }}>
      <ProductHeader title="My Purchases" description="Overview of your past purchases." />
      <table>
        <thead>
          <tr style={{ fontWeight: 700 }}>
            <td style={{ paddingRight: 20 }}>Time</td>
            <td style={{ paddingRight: 20 }}>Package</td>
            <td style={{ paddingRight: 20 }}>Amount</td>
            <td style={{ paddingRight: 20 }}>Price</td>
            <td style={{ paddingRight: 20 }}>Method</td>
            <td style={{ paddingRight: 20 }}>State</td>
            <td style={{ paddingRight: 20 }}>ID</td>
          </tr>
        </thead>
        <tbody>
          {purchases.data != undefined &&
            Object.values(purchases.data.data).map((purchase: any, i: number) => (
              <PurchaseRow purchase={purchase} key={i} />
            ))}
        </tbody>
      </table>
      <p style={{ fontWeight: 100, fontSize: 14, marginBottom: 20, marginTop: 5, opacity: 0.7, maxWidth: 600 }}>
        In case there are any problems, please reach out to us! If possible mention the ID of the purchase.
      </p>
    </div>
  )
}

const PaymentButtons = ({
  message,
  price,
  data,
  price_approve = 0,
  buttonRef,
  set_is_waiting,
  subscription_period
}: {
  message: string
  price: number
  data: { quantity?: number; repetition?: string; stripe_price: string }
  price_approve: number
  set_is_waiting: any
  buttonRef: any
  subscription_period: string | null
}) => {
  return (
    <div className="absolute bottom-5">
      <label> Total: ${price * (data.quantity || 1) + (subscription_period != null ? ' ' + subscription_period : '')}</label>
      <div className="flex" style={{ marginTop: 15 }}>
        <button
          disabled={price == 0}
          ref={buttonRef}
          onClick={() => subscribeViaStripe(message, price, data)}
          style={{ marginRight: 15 }}
          className="flex items-center px-5 py-2 space-x-2 text-sm border border-white rounded-lg">
          <MdAdd />
          <span>Pay with Stripe</span>
        </button>
        <button
          disabled={price == 0}
          ref={buttonRef}
          onClick={() => purchaseViaUSDH(message, price * (data.quantity || 1), price_approve, data, set_is_waiting)}
          className="flex items-center px-5 py-2 space-x-2 text-sm border border-white rounded-lg">
          <MdAdd />
          <span>Pay with USDH</span>
        </button>
      </div>
    </div>
  )
}

// function get_flatrate_price(is_subscribed: bool) {
//   return is_subscribed ? 300 : 375
// }

// function get_flatrate_stripe_price(is_subscribed: bool, repetition: string) {
//   switch (repetition) {
//     case 'weekly':
//       return is_subscribed ? 'price_1MFfziCOIb8tHxq58AhDA66b' : 'price_1MFg2GCOIb8tHxq5C6eoVvEt'
//     case 'monthly':
//       return is_subscribed ? 'price_1MFfziCOIb8tHxq5glFmv5M8' : 'price_1MFg1zCOIb8tHxq528We3VmN'
//     case 'once':
//     default:
//       return is_subscribed ? 'price_1MFfziCOIb8tHxq5hVFZ8wTw' : 'price_1MFg1dCOIb8tHxq5BXy5gMOw'
//   }
// }

// const ProductFlatrate = ({
//   isSubscribed,
//   buttonRef,
//   set_is_waiting
// }: {
//   isSubscribed: bool
//   buttonRef: any
//   set_is_waiting: any
// }) => {
//   const [customers, set_customers] = useState(0)
//   const [repetition, set_repetition] = useState<string>('once')

//   const price_per_customer = get_flatrate_price(isSubscribed)
//   const stripe_price_per_customer = get_flatrate_stripe_price(isSubscribed, repetition)

//   const data = { quantity: customers, repetition, stripe_price: stripe_price_per_customer }

//   return (
//     <div className="pb-[100px]">
//       <ProductHeader
//         title="Guaranteed Customers"
//         description="Pay per customer we get you, if we can't deliver, we'll credit your account! This saves you thousands of dollars in upfront marketing since we're paying the upfront cost of reaching a desired Cost Per Acquisition. You can either buy customers one time, or set up a recurring purchase."
//       />
//       <div className="flex" style={{ marginBottom: 15 }}>
//         <p style={{ marginTop: 8, marginRight: 15 }}>Amount of customers: </p>
//         <input
//           onChange={(e) => set_customers(parseInt(e.target.value))}
//           type="number"
//           className="flex items-center px-5 py-2 space-x-2 text-sm border border-white rounded-lg text-dark"
//           style={{ width: 90, marginRight: 10 }}
//         />
//       </div>
//       <select
//         className="rounded-lg text-dark"
//         style={{ marginBottom: 15 }}
//         defaultValue="select"
//         onChange={(e) => set_repetition(e.target.value)}>
//         <option value="select" disabled>
//           Select Repetition
//         </option>
//         <option value="once">Once (one time payment)</option>
//         <option value="weekly">Weekly (Makes it a weekly subscription)</option>
//         <option value="monthly">Monthly (makes it a monthly subscription) </option>
//       </select>
//       <PaymentButtons
//         message="flatrate"
//         buttonRef={buttonRef}
//         price={price_per_customer}
//         data={data}
//         price_approve={0}
//         set_is_waiting={set_is_waiting}
//         subscription_period={['weekly', 'monthly'].includes(repetition) ? repetition : null}
//       />
//     </div>
//   )
// }

const ProductSubscription = ({ buttonRef, set_is_waiting }: { buttonRef: any; set_is_waiting: any }) => {
  const monthly_price = 300
  return (
    <div className="pb-[100px]">
      <ProductHeader
        title="Organic Growth"
        description="Let our team explode your organic reach using the same methods fortune 500 companies use to explode their business. You will also get a $75 discount off guaranteed customers."
      />
      <ul style={{ fontWeight: 100, fontSize: 14, opacity: 0.7, paddingLeft: 20, marginBottom: 20 }}>
        <li>✔ Professionally writing a monthly targeted article to boost SEO</li>
        <li>✔ Growing your social media presence with organic content(Twitter & Instagram) </li>
        <li>✔ Building your SEO campaign & backlinking(10 high DA backlinks a month)</li>
      </ul>
      <p style={{ fontWeight: 100, fontSize: 14, opacity: 0.7, paddingLeft: 20, marginTop: 20, marginBottom: 10 }}>
        Beta Features:
      </p>
      <ul style={{ fontWeight: 100, fontSize: 14, opacity: 0.7, paddingLeft: 20, marginBottom: 20 }}>
        <li>✔ A monthly newsletter sent to your customers & prospects </li>
        <li>✔ Access to a lead database(“Outreach Center”) with leads you can reach out to. </li>
      </ul>
      <p style={{ fontWeight: 100, fontSize: 14, opacity: 0.7, paddingLeft: 20, marginTop: 20, marginBottom: 10 }}>
        Features Coming Soon:
      </p>
      <ul style={{ fontWeight: 100, fontSize: 14, opacity: 0.7, paddingLeft: 20, marginBottom: 20 }}>
        <li>✔ Automated SMS & Email scripts to send to your leads in lead database</li>
        <li>
          ✔ Integrated ChatGPT into your article / blog center on the management dashboard for instant article writing!{' '}
        </li>
      </ul>
      <PaymentButtons
        message="subscription"
        buttonRef={buttonRef}
        price={monthly_price}
        data={{ quantity: 1, stripe_price: 'price_1MFPAGCOIb8tHxq5WuDeEww9' }}
        set_is_waiting={set_is_waiting}
        price_approve={monthly_price * 11}
        subscription_period="monthly"
      />
    </div>
  )
}

// function isValidSubscriptionInPurchases(purchases: { name: string; state?: string }[]) {
//   if (purchases) {
//     for (let i = 0; i < purchases.length; i++) {
//       if (purchases[i].name === 'subscription' && purchases[i].state === 'completed') {
//         return true
//       }
//     }
//   }
//   return false
// }

interface ServicesProps {
  hidePurchases?: boolean
  hideDescription?: boolean
}
export const Services: React.FC<ServicesProps> = ({ hidePurchases, hideDescription }) => {
  const [addSiteModal, setAddSiteModal] = useState(false)
  const [is_waiting, set_is_waiting] = useState(false)
  const purchases: any = usePurchases()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const callback_purchase_id = useSearchParam('callback_purchase_id')
  // const isSubscribed = isValidSubscriptionInPurchases(purchases?.data?.data)
  // const user = useMe()

  useEffect(() => {
    if (callback_purchase_id) {
      updatePurchase(callback_purchase_id).then(() => {
        window.location.href = window.location.href.split('?')[0]
      })
    }
  }, [callback_purchase_id])

  return (
    <div className="flex flex-col space-y-5">
      {!hideDescription && (
        <p className="mb-10">
          There are two major ways to grow your Husl business! You can either use the tools and resources designed to help
          you grow organically, such as your blog, marketing materials, and social accounts. Or you can let us grow your
          business on autopilot by hiring us for either or both services below.
          <br />
          <br />
          Flat rate customers are discounted from $375/customer to $300/customer if you're paying for the “Organic Growth”
          subscription.{' '}
        </p>
      )}

      <div className="relative flex space-x-3">
        {/* <div className="flex-1" style={{ backgroundColor: '#084', padding: 30, borderRadius: 10 }}>
          <ProductFlatrate buttonRef={buttonRef} isSubscribed={isSubscribed} set_is_waiting={set_is_waiting} />
        </div> */}
        <div className="flex-1" style={{ backgroundColor: '#181818', padding: 30, borderRadius: 10 }}>
          <ProductSubscription buttonRef={buttonRef} set_is_waiting={set_is_waiting} />
        </div>
      </div>
      {!hidePurchases && <PurchaseTable purchases={purchases} />}
      {/* {user?.data?.data?.name === 'Lukas' && (
        <button className="p-3 text-black bg-white rounded w-[100px]" onClick={() => test({})}>
          Test
        </button>
      )} */}
      {/* <button className="p-3 text-black bg-white rounded w-[100px]" onClick={() => test({})}>
        Test
      </button> */}
      <CompactModal
        show={addSiteModal}
        onClose={() => setAddSiteModal(false)}
        pos={{
          x: (buttonRef.current?.getBoundingClientRect().x || 0) + (buttonRef?.current?.clientWidth || 0),
          y: (buttonRef.current?.getBoundingClientRect().y || 0) + (buttonRef?.current?.clientHeight || 0) + 20
        }}>
        <p className="mb-3">Create an end user account!</p>
        <AddAccountCompact />
      </CompactModal>
      {is_waiting ? <WaitScreen title="Waiting for transaction confirmation..." /> : <></>}
    </div>
  )

  /**
   *
   */
}
