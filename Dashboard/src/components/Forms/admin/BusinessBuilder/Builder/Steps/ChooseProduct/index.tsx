import Button from '@components/Button'
import { SelectProduct } from '@components/Forms/components/Selects/dynamic/Product'
import { useBusiness } from '@hooks/useBusiness'
import { UpdateBusinessDto } from '@src/restapi/businesses/business'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

interface ChooseProductProps {
  onNext?: (nextStepIndex: number, data?: UpdateBusinessDto) => any
}
export const ChooseProduct: React.FC<ChooseProductProps> = ({ onNext }) => {
  const { query } = useRouter()
  const businessId = query?.businessId as string
  const { data } = useBusiness(businessId)
  const [selectedProduct, setSelectedProduct] = useState<any>()

  const handleSubmitBusinessProduct = () => {
    // if (data?.data?.generated) {
    //   toast.error('Website is already generated')
    //   return
    // }
    if (!selectedProduct) {
      toast.error('Please select a product')
      return
    }
    return onNext?.(1, {
      product: selectedProduct
    })
  }

  useEffect(() => {
    setSelectedProduct({
      label: data?.data?.product?.name || data?.data?.product?.name,
      value: data?.data?.product?._id
    })
    return () => {
      setSelectedProduct(undefined)
    }
  }, [data?.data])
  return (
    <div>
      <div className="mb-5">
        <SelectProduct
          key={data?.data?._id}
          label="Choose Product"
          value={selectedProduct?.value}
          setFieldValue={(_, value) => {
            setSelectedProduct(value)
          }}
        />
      </div>
      <Button onClick={handleSubmitBusinessProduct} text="Save & Continue" />
    </div>
  )
}
