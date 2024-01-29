import { GET_PRODUCTS } from '@src/restapi/products/constants'
import { useMemo } from 'react'
import useSWR from 'swr'
import { Selection, SelectionProps } from '../Selection'

export const MultipleSelectProduct: React.FC<SelectionProps> = ({ ...props }) => {
  const { data: products } = useSWR<RestApi.Response<Product[]>>(GET_PRODUCTS)

  const productList = useMemo(() => {
    if (products && products?.data?.length > 0) {
      return products?.data?.map((item) => ({
        label: item?.name || item?.websiteKey,
        value: item._id
      }))
    } else {
      return []
    }
  }, [products])
  return <Selection items={productList} {...props} />
}
