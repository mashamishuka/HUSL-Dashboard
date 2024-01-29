import { Setting } from '@src/restapi/setting/setting'
import useSWR from 'swr'

export const useSetting = (key: string) => {
  const { data, error, isLoading, mutate } = useSWR<RestApi.Response<Setting[]>>('/settings')

  const state = isLoading ? 'loading' : error ? 'error' : 'success'
  if (data) {
    const setting = data.data.find((s) => s.key === key)
    if (setting) {
      return { ...setting, state }
    }
  }
  return {
    key,
    value: null,
    state,
    mutate,
    error
  }
}
