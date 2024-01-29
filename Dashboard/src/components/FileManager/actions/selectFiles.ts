import { useHookstate } from '@hookstate/core'
import { selectedFilesState } from '@states/fileManagers/selectedFiles'

export const selectFiles = (
  data: FileManager.File & {
    Prefix?: string
  }
) => {
  const selectedFiles = useHookstate(selectedFilesState)

  if (!data?.Key && !data?.Prefix) return

  // update selected files state
  // if the clicked item is already selected, then unselect it
  if (selectedFiles.get()?.[data?.Key]) {
    const selected = selectedFiles.get()
    delete (selected as any)?.[data?.Key]
    selectedFiles.set(selected)
  } else {
    selectedFiles.merge({
      [data?.Key]: data
    })
  }
}
