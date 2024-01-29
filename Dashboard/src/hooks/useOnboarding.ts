import { GET_ONBOARDINGS_ITEM, GET_ONBOARDING_PROGRESS } from '@src/restapi/onboardings/constants'
import useSWR from 'swr'

export const useOnboarding = () => {
  const data = useSWR<RestApi.Response<Onboarding[]>>(GET_ONBOARDINGS_ITEM)

  return data
}

export const useOnboardingProgress = (businessId?: string) => {
  const data = useSWR<RestApi.Response<OnboardingProgress[]>>(businessId ? GET_ONBOARDING_PROGRESS + businessId : null)
  return data
}
