import { GET_NICHES } from '@src/restapi/niche/constants'
import { useMemo } from 'react'
import useSWR from 'swr'
import { Selection, SelectionProps } from '../Selection'

export const MultipleSelectNiche: React.FC<SelectionProps> = ({ ...props }) => {
  const { data: niches } = useSWR<RestApi.Response<Niche[]>>(GET_NICHES)

  const nicheList = useMemo(() => {
    if (niches && niches?.data?.length > 0) {
      return niches?.data?.map((item) => ({
        label: item?.name || item?._id,
        value: item._id
      }))
    } else {
      return []
    }
  }, [niches])
  return <Selection items={nicheList} {...props} />
}
