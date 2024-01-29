import { MdCheck, MdChevronLeft, MdClose, MdImage } from 'react-icons/md'
import { useToggle } from 'react-use'

import Button from '@components/Button'
import { confirm } from '@components/ConfirmationBox'

import { UpdateBusinessDto } from '@src/restapi/businesses/business'
import dynamic from 'next/dynamic'
import { SuccessAlert, WarningAlert } from '@components/Alerts'
import { Disclosure } from '@headlessui/react'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import { useBusiness } from '@hooks/useBusiness'
import { useState, useEffect, useMemo } from 'react'
import { ChooseProduct } from '../ChooseProduct'
import { SelectNiche } from '../SelectNiche'
import { BrandDetail } from '../Brand'
import { WebsiteGenerate } from '../Website'
import { EmailPlatform } from '../EmailPlatform'
import { updateBusiness } from '@src/restapi/businesses/mutation'
import { toast } from 'react-toastify'

const GenerateGraphicsModal = dynamic<any>(
  () => import('@components/Modals/GenerateGraphicsModal').then((mod) => mod.GenerateGraphicsModal),
  {
    ssr: false
  }
)

const stepOptions = [
  { name: 'Product', key: 'choose-product', status: 'pending' },
  { name: 'Niche', key: 'select-niche', status: 'pending' },
  { name: 'Branding', key: 'branding', status: 'pending' },
  { name: 'Website', key: 'website', status: 'pending' },
  { name: 'Email Platform (optional)', key: 'email-platform', status: 'completed' }
]
interface PublishBusinessProps {
  onNext?: (nextStepIndex: number, data?: Record<string, any>) => any
}
export const PublishBusiness: React.FC<PublishBusinessProps> = ({ onNext }) => {
  const { query } = useRouter()
  const businessId = query?.businessId as string
  const { data, mutate } = useBusiness(businessId)
  const [showGenerateGraphicsModal, setShowGenerateGraphicsModal] = useToggle(false)
  const [steps, setSteps] = useState(stepOptions)
  const [generating, setGenerating] = useState(false)

  const handlePublishBusinessProcess = async () => {
    const confirmation = await confirm('Are you sure you want to generate website?')
    if (confirmation) {
      setGenerating(true)
      await onNext?.(-1, {
        generate: true
      })
      setGenerating(false)
      return
    }
    return
  }

  const handleNextStep = async (nextStepIndex: number, data?: UpdateBusinessDto) => {
    if (!data) {
      return
    }
    // remove empty values or '' values from data
    const cleanData = Object.keys(data).reduce((acc, key) => {
      if ((data as any)[key] !== '' && (data as any)[key] !== null && (data as any)[key] !== undefined) {
        // prettier-ignore
        (acc as any)[key] = (data as any)[key]
      }
      return acc
    }, {} as UpdateBusinessDto)
    try {
      const updatedBusiness = await updateBusiness(businessId, cleanData)
      if (updatedBusiness?.data) {
        toast.success('Business updated successfully.')
        // set steps status, and active index
        const newSteps = [...steps]
        newSteps[nextStepIndex - 1].status = 'completed'
        setSteps(newSteps)
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Something went wrong. Please try again later.')
    }
    mutate?.()
    return data
  }

  const canGenerateBusiness = useMemo(() => {
    if (data?.data?.generated || generating) {
      return false
    }
    // check steps if has no pending
    const hasPending = steps?.filter((v) => v.status !== 'completed')
    if (hasPending?.length > 0) {
      return false
    }
    return true
  }, [steps])

  useEffect(() => {
    const newSteps = [...steps]
    if (data?.data?.product) {
      newSteps[0].status = 'completed'
    } else {
      newSteps[0].status = 'pending'
    }
    if (data?.data?.niche) {
      newSteps[1].status = 'completed'
    } else {
      newSteps[1].status = 'pending'
    }
    if (
      data?.data?.logo &&
      data?.data?.favicon &&
      data?.data?.primaryColor &&
      data?.data?.secondaryColor &&
      data?.data?.customFields?.welcomeText
    ) {
      newSteps[2].status = 'completed'
    } else {
      newSteps[2].status = 'pending'
    }
    if (
      (data?.data?.domain && (data?.data?.user?.name || data?.data?.user?.email || data?.data?.user?._id)) ||
      (data?.data?.accounts?.email && data?.data?.accounts?.email?.password && data?.data?.accounts?.email?.nftId)
    ) {
      newSteps[3].status = 'completed'
    } else {
      newSteps[3].status = 'pending'
    }
    setSteps(newSteps)
  }, [data?.data])
  return (
    <div>
      <div className="mb-3">
        <h1 className="mb-3">Publish Business</h1>
        {!data?.data?.generated && (
          <WarningAlert>
            <span className="block text-sm leading-5 text-white text-opacity-90">
              Before publishing your business, please review the business detail and check if it's ok. You <b>won't</b> be
              able to edit the business detail once it's generated.
            </span>
          </WarningAlert>
        )}
        {data?.data?.generated && (
          <SuccessAlert>
            <span className="block text-sm leading-5 text-white text-opacity-90">
              This business has been generated. Further edit is not possible.
            </span>
          </SuccessAlert>
        )}
      </div>
      <div className="flex flex-col mb-5 space-y-3">
        {steps?.map((step, index) => (
          <Disclosure as="div" key={index} className="p-5 rounded-lg bg-dark">
            {({ open }) => (
              <>
                <Disclosure.Button as="div" className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-4">
                    <span
                      className={clsx(
                        'flex items-center justify-center text-black rounded-full w-6 h-6 font-bold',
                        step.status === 'completed' && 'bg-primary',
                        step.status === 'pending' && 'bg-danger'
                      )}>
                      {step.status === 'completed' && <MdCheck />}
                      {step.status === 'pending' && <MdClose className="text-white" />}
                    </span>
                    <h1 className="text-white">{step?.name}</h1>
                  </div>
                  <MdChevronLeft className={clsx('transform text-2xl cursor-pointer', open ? 'rotate-90' : '-rotate-90')} />
                </Disclosure.Button>
                <Disclosure.Panel className="mt-4">
                  {step.key === 'choose-product' && <ChooseProduct onNext={handleNextStep} />}
                  {step.key === 'select-niche' && <SelectNiche onNext={handleNextStep} />}
                  {step.key === 'branding' && <BrandDetail onNext={handleNextStep} />}
                  {step.key === 'website' && <WebsiteGenerate onNext={handleNextStep} />}
                  {step.key === 'email-platform' && <EmailPlatform onNext={handleNextStep} />}
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
        ))}
      </div>
      <div className="flex items-center space-x-3">
        <Button
          text="Generate Business"
          onClick={() => canGenerateBusiness && handlePublishBusinessProcess()}
          disabled={!canGenerateBusiness}
          loading={generating}
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <Button
          onClick={setShowGenerateGraphicsModal}
          variant="outline"
          className="flex items-center space-x-2 transition-opacity border-blue-500 hover:opacity-80">
          <MdImage />
          <span>Generate Graphics</span>
        </Button>
      </div>
      <GenerateGraphicsModal open={showGenerateGraphicsModal} onClose={() => setShowGenerateGraphicsModal(false)} />
    </div>
  )
}
