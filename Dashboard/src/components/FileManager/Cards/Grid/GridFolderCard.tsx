import { handleFileManagerClick } from '@components/FileManager/actions/handleFileManagerClick'
import { Folder } from '@components/Icons'
import { useCommandHeld } from '@hooks/useCommandHeld'
import { useHookstate } from '@hookstate/core'
import { selectedFilesState } from '@states/fileManagers/selectedFiles'
import { getFilePrefix } from '@utils/index'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'

export const GridFolderCard: React.FC<FileManager.Folder> = ({ Prefix }) => {
  const commandHeld = useCommandHeld()
  const { push, query } = useRouter()
  const folder = query.folder as string[]
  const folders = folder?.join('/')

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
  const handleOpenFolder = async () => {
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
        'relative z-0 flex flex-wrap items-center justify-center h-48 px-1 pt-2 text-center border-2 border-transparent border-dashed rounded-lg cursor-pointer select-none sm:h-56 lg:h-60 hover:bg-secondary',
        files?.[Prefix] && 'bg-secondary'
      )}>
      <div className="w-full">
        <div className="relative mx-auto">
          {/* Folder icon */}
          <div className="inline-block mt-3 mb-5 transform scale-150 lg:mt-2 lg:mb-8 text-primary">
            <Folder />
          </div>
          {/* Folder information such as files count, created at and title. */}
          <div className="text-center">
            <span className="inline-block w-full text-sm font-bold leading-3 tracking-tight text-ellipsis whitespace-nowrap md:px-6">
              {getFilePrefix(Prefix)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
