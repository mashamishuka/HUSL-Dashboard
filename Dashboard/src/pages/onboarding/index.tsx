import type { NextLayoutComponentType } from 'next'
import { MainLayout } from '@components/Layouts/MainLayout'
import { Wrapper } from '@components/Layouts/Wrapper'
import clsx from 'clsx'
import { MdCheck, MdChevronLeft, MdClose } from 'react-icons/md'
import { useState, useMemo, useEffect } from 'react'
import { useOnboarding, useOnboardingProgress } from '@hooks/useOnboarding'
import { VideoPlayer } from '@components/VideoPlayer'
import Button from '@components/Button'
import { AddSocialCompact } from '@components/Forms/AddSocialCompact'
import { useActiveBusiness } from '@hooks/useActiveBusiness'
import { toast } from 'react-toastify'
import { saveOnboardingProgress } from '@src/restapi/onboardings/mutation'
import { confirm } from '@components/ConfirmationBox'
import { updateBusiness } from '@src/restapi/businesses/mutation'
import { useRouter } from 'next/router'
import { useBusiness } from '@hooks/useBusiness'
import { BrandOverview } from '@components/BrandOverview'
import { Services } from '@components/Service'
import { getTagCopies, replaceBulk } from '@utils/index'
import { Disclosure } from '@headlessui/react'

interface CompleteOnboardingProps {
  data?: (Onboarding & {
    status?: 'completed' | 'pending' | 'skiped'
  })[]
}
const CompleteOnboarding: React.FC<CompleteOnboardingProps> = ({ data }) => {
  const { business: activeBusiness } = useActiveBusiness()
  const { data: business } = useBusiness(activeBusiness?._id)
  const { copyFrom, copyTo } = getTagCopies(business?.data)

  return (
    <div className="flex flex-col mb-5 space-y-3">
      {data?.map((onboard, index) => (
        <Disclosure as="div" key={index} className="p-5 rounded-lg bg-secondary">
          {({ open }) => (
            <>
              <Disclosure.Button as="div" className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-4">
                  <span
                    className={clsx(
                      'flex items-center justify-center text-black rounded-full w-6 h-6 font-bold',
                      onboard.status === 'completed' && 'bg-primary',
                      onboard.status === 'pending' && 'bg-danger'
                    )}>
                    {onboard.status === 'completed' && <MdCheck />}
                    {onboard.status === 'pending' && <MdClose className="text-white" />}
                  </span>
                  <h1 className="text-white">{onboard?.title}</h1>
                </div>
                <MdChevronLeft className={clsx('transform text-2xl cursor-pointer', open ? 'rotate-90' : '-rotate-90')} />
              </Disclosure.Button>
              <Disclosure.Panel className="flex flex-col pl-1 my-3 mt-4 ml-12 space-y-5">
                <div dangerouslySetInnerHTML={{ __html: replaceBulk(onboard?.content, copyFrom, copyTo) || '' }} />
                {onboard?.videoAttachment?.url && (
                  <div>
                    <hr className="mb-4 border-secondary" />
                    <label className="block mb-2 text-sm medium">Video Attachment</label>
                    <div className="w-1/2">
                      <VideoPlayer src={onboard?.videoAttachment?.url} />
                    </div>
                  </div>
                )}
                {onboard?.renderFeature && (
                  <div className="p-5 rounded-lg bg-secondary">
                    {onboard?.renderFeature === 'brand-overview' && <BrandOverview />}
                    {onboard?.renderFeature === 'pricing' && <Services hidePurchases />}
                  </div>
                )}
                {onboard?.mapFields && (
                  <div className="p-5 my-3 rounded-lg bg-secondary">
                    {onboard?.mapFields === 'social-access' && <AddSocialCompact />}
                  </div>
                )}
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      ))}
    </div>
  )
}

const OnboardingPage: React.FC<{ defaultActiveStep?: number }> = ({ defaultActiveStep }) => {
  const router = useRouter()
  const { data: onboardings, isLoading } = useOnboarding()
  const { business: activeBusiness } = useActiveBusiness()
  const { data: progress, mutate: mutateProgress } = useOnboardingProgress(activeBusiness?._id)
  const { data: business, mutate: mutateBusiness } = useBusiness(activeBusiness?._id)
  const [step, setStep] = useState(defaultActiveStep)
  const [lastStep, setLastStep] = useState(defaultActiveStep)
  const [saving, setSaving] = useState(false)
  const { copyFrom, copyTo } = getTagCopies(business?.data)

  const handleStepClick = (index: number) => {
    if (lastStep != undefined && lastStep < index) return
    setStep(index)
  }

  const completeOnboarding = async () => {
    if (!activeBusiness?._id) return
    const confirmation = await confirm('Are you sure you want to complete onboarding?')
    if (!confirmation) return
    try {
      await updateBusiness(activeBusiness?._id, {
        onboardingCompleted: true
      })
      toast.success('Onboarding completed successfully')
      await mutateBusiness()
      router.push('/')
    } catch (error: any) {
      toast.error(error?.message || 'Something went wrong, please try again later')
    }
  }

  const handleAction = async (id: string, action: OnboardingActions) => {
    // count completed onboarding
    const completedOnboarding = progress?.data?.filter((p) => p?.status === 'completed').length

    if (action?.type === 'finalize') {
      if (completedOnboarding && onboardings?.data && completedOnboarding < onboardings?.data?.length) {
        toast.error('Please complete all onboarding steps before finalizing.')
        return
      }
      setSaving(true)
      await completeOnboarding()
      setSaving(false)
      return
    }
    switch (action.type) {
      case 'plain-url':
        // open url in new tab
        window.open(action.url, '_blank')
        break
      default:
        try {
          const confirmation = await confirm('Are you sure you want to mark this as completed?')
          if (!confirmation) {
            return
          }
          setSaving(true)
          await saveOnboardingProgress({
            business: activeBusiness?._id,
            onboarding: id,
            status: 'completed'
          })
          await mutateProgress()
        } catch (error: any) {
          toast.error(error?.message || 'Something went wrong, please try again later')
        }
        break
    }
    setSaving(false)
  }

  const onboards = useMemo(() => {
    if (!onboardings?.data || isLoading) return []
    const onboard = onboardings?.data.map((onboarding) => {
      return {
        ...onboarding,
        status: progress?.data?.find(
          (p) => p?.onboarding === onboarding?._id && p?.business?.toString() == activeBusiness?._id
        )?.status
      }
    })
    return onboard
  }, [progress, onboardings])

  const onboardingSteps = useMemo(() => {
    return [
      ...onboards,
      {
        _id: 'complete',
        title: 'Review and Complete',
        status: 'pending',
        content: '',
        mapFields: null,
        renderFeature: null,
        videoAttachment: null,
        actions: [
          {
            type: 'finalize' as any,
            text: 'Complete Onboarding',
            theme: 'primary' as any
          }
        ]
      }
    ]
  }, [onboards])

  const canClickNext = useMemo(() => {
    if (!onboardingSteps || step == undefined || saving) return false
    return onboardingSteps[step]?.status !== 'completed'
  }, [step, onboardingSteps, saving])

  useEffect(() => {
    if (!onboardingSteps) return
    const index = onboardingSteps.findIndex((onboarding) => onboarding?.status !== 'completed')
    setStep(index)
    setLastStep(index)
    return () => {
      setStep(undefined)
      setLastStep(undefined)
    }
  }, [progress, onboardings, onboardingSteps])

  useEffect(() => {
    if (!business) return
    if (business?.data?.onboardingCompleted) {
      router.push('/')
    }
  }, [business, activeBusiness])

  if (isLoading) {
    return <div>Loading...</div>
  }
  return (
    <ul className="flex flex-col space-y-5">
      {onboardingSteps?.map((onboarding, index) => (
        <li
          key={index}
          className={clsx('flex flex-col space-y-3 rounded-lg transition-all', step === index && 'bg-dark p-4')}>
          <div role="button" onClick={() => handleStepClick(index)} className="flex items-center space-x-4">
            <span
              className={clsx(
                'flex items-center justify-center text-black rounded-full w-9 h-9 text-xl font-bold',
                step === index ? 'bg-primary' : 'bg-lightGray'
              )}>
              {onboarding?.status === 'completed' ? <MdCheck /> : index + 1}
            </span>
            <h1 className={clsx('text-xl text-white', step !== index && 'text-opacity-70 hover:text-opacity-100')}>
              {onboarding?.title}
            </h1>
          </div>
          {step === index && (
            <div className="flex flex-col pl-1 my-3 ml-12 space-y-5">
              <div dangerouslySetInnerHTML={{ __html: replaceBulk(onboarding?.content, copyFrom, copyTo) || '' }} />
              {onboarding?.videoAttachment?.url && (
                <div>
                  <hr className="mb-4 border-secondary" />
                  <label className="block mb-2 text-sm medium">Video Attachment</label>
                  <div className="w-1/2">
                    <VideoPlayer src={onboarding?.videoAttachment?.url} />
                  </div>
                </div>
              )}
              {onboarding?.renderFeature && (
                <div className="p-5 rounded-lg bg-secondary">
                  {onboarding?.renderFeature === 'brand-overview' && <BrandOverview />}
                  {onboarding?.renderFeature === 'pricing' && <Services hidePurchases />}
                </div>
              )}
              {onboarding?.mapFields && (
                <div className="p-5 my-3 rounded-lg bg-secondary">
                  {onboarding?.mapFields === 'social-access' && <AddSocialCompact />}
                </div>
              )}
              {/* Review onboarding to complete */}
              {onboarding?._id === 'complete' && <CompleteOnboarding data={onboards} />}

              {/* Render actions */}
              <div className="flex items-center mt-5 space-x-3">
                {onboarding?.actions?.map((action, i) => (
                  <Button
                    key={i}
                    text={action?.text}
                    variant={action?.theme}
                    onClick={() => canClickNext && handleAction(onboarding?._id, action)}
                    disabled={!canClickNext}
                    loading={action?.type !== 'plain-url' && saving}
                  />
                ))}
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
const Page: NextLayoutComponentType = () => {
  return (
    <div>
      <Wrapper>
        <div className="flex flex-col space-y-1 mb-7">
          <h1 className="text-xl">Welcome to your future.</h1>
          <span className="text-xs">Let’s set up your new business!</span>
        </div>
        <OnboardingPage defaultActiveStep={0} />
      </Wrapper>
    </div>
  )
}

Page.getLayout = function getLayout(page) {
  return <MainLayout children={page} />
}

export default Page
