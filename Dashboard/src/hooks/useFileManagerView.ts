import { useHookstate } from '@hookstate/core'
import { viewTypeState } from '@states/fileManagers/viewType'

export const useFileManagerView = () => {
  const viewType = useHookstate(viewTypeState)
  const type = viewType.get()

  const toggleViewType = () => {
    viewType.set(type === 'list' ? 'grid' : 'list')
  }

  return { viewType: type, toggleViewType }
}
