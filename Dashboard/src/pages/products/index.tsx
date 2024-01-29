import { useRef, useState } from 'react'
import { MdAdd } from 'react-icons/md'
import Web3 from 'web3'
import { AbiItem } from 'web3-utils'

import { AddAccountCompact } from '@components/Forms'
import { MainLayout } from '@components/Layouts/MainLayout'
import { Wrapper } from '@components/Layouts/Wrapper'
import { CompactModal } from '@components/Modals'

import ABI_ERC20 from './abi_erc20.json'

import type { NextLayoutComponentType } from 'next'
import { ADDRESS_CONTRACT } from '@consts/addresses'

const ProductHeader = ({ title, description }: { title: string; description: string }) => {
  return (
    <>
      <h1 style={{ fontSize: 26, marginTop: 100 }}>{title}</h1>
      <p style={{ fontWeight: 100, fontSize: 14, marginBottom: 20, marginTop: 5, opacity: 0.7, maxWidth: 600 }}>
        {description}
      </p>
    </>
  )
}

async function purchase(amount: any) {
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
    await contract_usdh.methods.approve(address, amount).send({ from: address })
  })
}

const ProductsPage: NextLayoutComponentType = () => {
  const [addSiteModal, setAddSiteModal] = useState(false)
  const [customers, set_customers] = useState(0)
  const buttonRef = useRef<HTMLButtonElement>(null)

  return (
    <div className="flex flex-col space-y-5">
      <Wrapper title="Services">
        <ProductHeader
          title="Flat Rate Growth"
          description="Pay per customer we get you, if we can’t deliver, we’ll refund your payment. This saves you thousands of upfront dollars getting to your CPA."
        />
        <div className="flex" style={{ marginBottom: 15 }}>
          <p style={{ marginTop: 8, marginRight: 15 }}>Amount of customers: </p>
          <input
            onChange={(e) => set_customers(parseInt(e.target.value))}
            type="number"
            className="flex items-center px-5 py-2 space-x-2 text-sm border border-white rounded-lg text-dark"
            style={{ width: 90, marginRight: 10 }}
          />
        </div>
        <select className="rounded-lg text-dark" style={{ marginBottom: 15 }} defaultValue="select">
          <option value="select">Select Repetition</option>
          <option>Once (one time payment)</option>
          <option>Weekly (Makes it a weekly subscription)</option>
          <option>Monthly (makes it a monthly subscription) </option>
        </select>
        <button
          disabled={customers <= 0}
          ref={buttonRef}
          onClick={() => purchase(customers * 370 + '000000000000000000')}
          className="flex items-center px-5 py-2 space-x-2 text-sm border border-white rounded-lg">
          <MdAdd />
          <span>Purchase {customers > 0 ? '($' + customers * 370 + ')' : ''}</span>
        </button>

        <ProductHeader
          title="Organic Growth"
          description="Our team of professional organic marketing managers will grow your organic reach using the same methods fortune 500 companies use to explode their business. You also get a $75 discount off flat rate customers when paying for this option."
        />
        <ul style={{ fontWeight: 100, fontSize: 14, opacity: 0.7, paddingLeft: 20, marginBottom: 20 }}>
          <li>✔ Building your SEO campaign & backlinking to get you ranking on google (takes 4-6 months)</li>
          <li>✔ Writing a monthly targeted article to boost SEO</li>
          <li>✔ Growing your social media presence with organic content.</li>
        </ul>
        <button
          ref={buttonRef}
          onClick={() => purchase(300 + '000000000000000000')}
          className="flex items-center px-5 py-2 space-x-2 text-sm border border-white rounded-lg">
          <MdAdd />
          <span>Subscribe ($300/mo)</span>
        </button>
      </Wrapper>
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
    </div>
  )
}

ProductsPage.getLayout = function getLayout(page) {
  return <MainLayout children={page} />
}

export default ProductsPage
