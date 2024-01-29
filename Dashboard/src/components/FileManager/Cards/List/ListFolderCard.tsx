import { handleFileManagerClick } from '@components/FileManager/actions/handleFileManagerClick'
import { Folder } from '@components/Icons'
import { useCommandHeld } from '@hooks/useCommandHeld'
import { useHookstate } from '@hookstate/core'
import { selectedFilesState } from '@states/fileManagers/selectedFiles'
import { getFilePrefix } from '@utils/index'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'

export const ListFolderCard: React.FC<FileManager.Folder> = ({ Prefix }) => {
  const { push, query } = useRouter()
  const folder = query.folder as string[]
  const folders = folder?.join('/')
  const commandHeld = useCommandHeld()

  const selectedFiles = useHookstate(selectedFilesState)
  const files = selectedFiles.get({
    noproxy: true
  })
  const selectFiles = () => {
    if (!Prefix) return
    // update selected files state

    // if the clicked item is not selected, then select it
    if (!files?.[Prefix] && !commandHeld) {
      selectedFiles.set({
        [Prefix]: { Prefix }
      })
    } else {
      // if the item is already selected, then unselect it
      if (files?.[Prefix]) {
        const selected = Object.assign({}, files)
        delete (selected as any)?.[Prefix]
        selectedFiles.set(selected)
      } else {
        // if the item is not selected, then select it
        selectedFiles.merge({
          [Prefix]: { Prefix }
        })
      }
    }
  }

  const handleOpenFolder = () => {
    if (Prefix?.endsWith('/')) {
      let paths = Prefix
      if (folder?.length) {
        paths = [...folder, Prefix]?.join('/')
      }
      push(`/marketing/graphics/${paths}`)
    } else {
      toast.error('This folder is not a directory.')
    }
  }

  return (
    <div
      onClick={selectFiles}
      onDoubleClick={handleOpenFolder}
      onContextMenu={(evt) => handleFileManagerClick('folder', evt, { Prefix }, folders)}
      className={clsx(
        'flex items-center py-2 border-2 border-transparent border-dashed cursor-pointer select-none rounded-xl px-2.5 hover:bg-secondary',
        files?.[Prefix] && 'bg-secondary'
      )}>
      <div className="relative w-16 shrink-0">
        <div className="text-primary">
          {/* If there's no folder icon */}
          <Folder />
          {/* TODO: add folder icon getted from api */}
        </div>
      </div>
      <div className="pl-2">
        <span className="block overflow-hidden text-sm font-bold mb-0.5 text-ellipsis whitespace-nowrap hover:underline cursor-text">
          {getFilePrefix(Prefix)}
        </span>
      </div>
    </div>
  )
}
