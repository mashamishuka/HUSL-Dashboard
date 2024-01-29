import { useBusiness } from '@hooks/useBusiness'
import { UpdateBusinessDto } from '@src/restapi/businesses/business'
import { updateBusiness } from '@src/restapi/businesses/mutation'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

import { BrandDetail } from './Steps/Brand'
import { ChooseProduct } from './Steps/ChooseProduct'
import { EmailPlatform } from './Steps/EmailPlatform'
import { PublishBusiness } from './Steps/PublishBusiness'
import { SelectNiche } from './Steps/SelectNiche'
import { WebsiteGenerate } from './Steps/Website'
import { StepTimeline } from './StepTimeline'

const stepOptions = [
  { name: 'Choose Product', key: 'choose-product', status: 'current' },
  { name: 'Select Niche', key: 'select-niche', status: 'upcoming' },
  { name: 'Branding', key: 'branding', status: 'upcoming' },
  { name: 'Website', key: 'website', status: 'upcoming' },
  { name: 'Publish Business', key: 'publish-business', status: 'upcoming' },
  { name: 'Email Platform (optional)', key: 'email-platform', status: 'upcoming' }
]

export const CreateBusinessForm: React.FC = () => {
  const { query, push } = useRouter()
  const businessId = query?.businessId as string
  const { data, mutate } = useBusiness(businessId)
  const [activeStep, setActiveStep] = useState('choose-product')
  const [steps, setSteps] = useState(stepOptions)

  const handleNextStep = async (nextStepIndex: number, data?: UpdateBusinessDto) => {
    if (!data) {
      if (nextStepIndex) {
        const newSteps = [...steps]
        newSteps[nextStepIndex].status = 'current'
        newSteps[nextStepIndex - 1].status = 'completed'
        setSteps(newSteps)
        setActiveStep(newSteps[nextStepIndex].key)
      } else {
        toast.error(`There's no data to update. Please fill all the required fields.`)
      }
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
        if (nextStepIndex === -1) {
          toast.success('Business created, redirecting...')
          push('/admin/builder/business')
          return
        }
        toast.success('Business updated successfully.')
        // set steps status, and active index
        const newSteps = [...steps]
        newSteps[nextStepIndex].status = 'current'
        newSteps[nextStepIndex - 1].status = 'completed'
        setSteps(newSteps)
        setActiveStep(newSteps[nextStepIndex].key)
      }
    } catch (error: any) {
      // remove first Error: text if there is any
      const errorMessage = error?.message?.replace('Error: ', '')
      toast.error(errorMessage || 'Something went wrong. Please try again later.')
    }
    return data
  }

  useEffect(() => {
    mutate?.()
  }, [steps])

  useEffect(() => {
    const newSteps = [...steps]
    let active = 0
    if (data?.data?.product) {
      newSteps[0].status = 'completed'
      newSteps[1].status = 'current'
      active = 1
    }
    if (data?.data?.niche) {
      newSteps[1].status = 'completed'
      newSteps[2].status = 'current'
      active = 2
    }
    if (data?.data?.logo && data?.data?.primaryColor && data?.data?.secondaryColor) {
      newSteps[2].status = 'completed'
      newSteps[3].status = 'current'
      active = 3
    }
    if (data?.data?.domain) {
      newSteps[3].status = 'completed'
      newSteps[4].status = 'current'
      active = 4
    }

    setSteps(newSteps)
    setActiveStep(newSteps[active].key)
  }, [data?.data])
  return (
    <div className="flex space-x-8">
      <StepTimeline steps={steps} currentKey={activeStep} onStepClick={setActiveStep} />
      <div className="flex-1">
        {activeStep === 'choose-product' && <ChooseProduct onNext={handleNextStep} />}
        {activeStep === 'select-niche' && <SelectNiche onNext={handleNextStep} />}
        {activeStep === 'branding' && <BrandDetail onNext={handleNextStep} />}
        {activeStep === 'website' && <WebsiteGenerate onNext={handleNextStep} />}
        {activeStep === 'publish-business' && <PublishBusiness onNext={handleNextStep} />}
        {activeStep === 'email-platform' && <EmailPlatform onNext={handleNextStep} />}
      </div>
    </div>
  )
}
