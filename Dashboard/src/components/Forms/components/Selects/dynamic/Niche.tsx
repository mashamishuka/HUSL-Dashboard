import { GET_NICHES } from '@src/restapi/niche/constants'
import { useMemo } from 'react'
import useSWR from 'swr'
import { SingleSelect, SingleSelectProps } from '../SingleSelect'

export const SelectNiche: React.FC<SingleSelectProps> = ({ ...props }) => {
  const { data: niche } = useSWR<RestApi.Response<Niche[]>>(GET_NICHES)

  const nicheList = useMemo(() => {
    if (niche && niche?.data?.length > 0) {
      const niches = niche?.data?.map((item) => ({
        label: item?.name || item?._id,
        value: item._id
      }))
      return [
        {
          label: 'Select Niche',
          value: ''
        },
        ...niches
      ]
    } else {
      return []
    }
  }, [niche])

  if (!nicheList.length) return <></>
  return <SingleSelect label="Select Niche" items={nicheList} {...props} />
}
