import { GET_WEBSITES, WEBHUSL_API_MASTER_KEY } from '@src/restapi/webhusl/constants'
import useSWR from 'swr'

// interface HuslWebsite {
//   current_page: number
//   data: {
//     id: number
//     user_id: number
//     template_id: number
//     code: string
//     name?: string
//     html?: string
//     css?: string
//     components?: string
//     sub_domain?: string
//   }[]
//   first_page_url: string
//   from: number
//   last_page: number
//   last_page_url: string
//   next_page_url: string
//   path: string
//   per_page: number
//   prev_page_url: string
//   to: number
//   total: number
//   links?: {
//     url?: string
//     label?: string
//     active?: boolean
//   }[]
// }

interface HuslWebsite {
  id: number
  user_id: number
  template_id: number
  code: string
  name?: string
  sub_domain?: string
  custom_domain?: string
}
export const useWebsites = (searchString?: string, apiKey = WEBHUSL_API_MASTER_KEY) => {
  let search = ''
  if (searchString) {
    search = `&search=${searchString}`
  }
  const { data, error, mutate } = useSWR<HuslWebsite[]>(GET_WEBSITES + apiKey + search)
  return {
    data,
    loading: !error && !data,
    error,
    mutate
  }
}
