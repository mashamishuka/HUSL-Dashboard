import { useHookstate } from '@hookstate/core'
import { headerHeightState } from '@states/headerHeight'
import { useEffect } from 'react'

export const useHeaderHeight = () => {
  const headerHeight = useHookstate(headerHeightState)

  useEffect(() => {
    if (headerHeight.get() === 0) {
      const headerElement = document.getElementById('MAIN_HEADER')
      if (headerElement) {
        headerHeight.set(headerElement.clientHeight)
      } else {
        headerHeight.set(120)
      }
    }
  }, [headerHeight])
  return { headerHeight: headerHeight.get(), setHeaderHeight: headerHeight.set }
}
