import Button from '@components/Button'
import { useBusiness } from '@hooks/useBusiness'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { SelectNiche as NicheSelect } from '@components/Forms/components/Selects/dynamic/Niche'
import { toast } from 'react-toastify'
interface SelectNicheProps {
  onNext?: (nextStepIndex: number, data?: Record<string, any>) => any
}
export const SelectNiche: React.FC<SelectNicheProps> = ({ onNext }) => {
  const { query } = useRouter()
  const businessId = query?.businessId as string
  const { data } = useBusiness(businessId)
  const [selectedNiche, setSelectedNiche] = useState<any>()

  const handleSubmitBusinessNiche = () => {
    // if (data?.data?.generated) {
    //   toast.error('Website is already generated')
    //   return
    // }
    if (!selectedNiche) {
      toast.error('Please select a niche')
      return
    }
    return onNext?.(2, {
      niche: selectedNiche
    })
  }

  useEffect(() => {
    setSelectedNiche(data?.data?.niche)
    return () => {
      setSelectedNiche(undefined)
    }
  }, [data?.data])

  return (
    <div>
      <div className="mb-5">
        <NicheSelect
          label="Select Niche"
          value={selectedNiche?._id}
          setFieldValue={(_, value) => {
            setSelectedNiche(value)
          }}
        />
      </div>
      <Button onClick={handleSubmitBusinessNiche} text="Save & Continue" />
    </div>
  )
}
