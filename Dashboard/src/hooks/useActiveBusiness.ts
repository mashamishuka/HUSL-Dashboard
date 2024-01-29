import { Business } from '@src/restapi/businesses/business'
import { useLocalStorage } from 'react-use'

export const useActiveBusiness = () => {
  const [business, setBusiness, resetBusiness] = useLocalStorage<Business | null>('activeBusiness', null)
  return { business, setBusiness, resetBusiness }
}
