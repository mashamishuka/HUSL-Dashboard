import { GET_PRODUCTS } from '@src/restapi/products/constants'
import { useMemo } from 'react'
import useSWR from 'swr'
import { SingleSelect, SingleSelectProps } from '../SingleSelect'

export const SelectProduct: React.FC<SingleSelectProps> = ({ ...props }) => {
  const { data: products } = useSWR<RestApi.Response<Product[]>>(GET_PRODUCTS)

  const productList = useMemo(() => {
    if (products && products?.data?.length > 0) {
      return products?.data?.map((item) => ({
        label: item?.name || item?._id,
        value: item._id
      }))
    } else {
      return []
    }
  }, [products])
  return (
    <SingleSelect
      label="Choose Product"
      items={[
        {
          label: 'Select Product',
          value: ''
        },
        ...productList
      ]}
      {...props}
    />
  )
}
