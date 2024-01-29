import { handleFileManagerClick } from '@components/FileManager/actions/handleFileManagerClick'
import { DefaultFileThumbnail } from '@components/FileManager/Misc'
import { formatBytes, isPreviewable } from '@utils/index'
import moment from 'moment'
import { FiLink } from 'react-icons/fi'
import Image from 'next/image'
import { useHookstate } from '@hookstate/core'
import { selectedFilesState } from '@states/fileManagers/selectedFiles'
import clsx from 'clsx'
import { useCommandHeld } from '@hooks/useCommandHeld'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

interface GridFileCardProps extends FileManager.File {
  initialFolder?: string
}
export const GridFileCard: React.FC<GridFileCardProps> = (props) => {
  const commandHeld = useCommandHeld()
  const { Size, Key, LastModified, Url } = props
  const { query } = useRouter()
  const folders = useMemo(() => {
    let flds = query?.folder as string[]
    // add initial folder to the first array of folder
    if (props?.initialFolder) {
      flds = [props?.initialFolder, ...(query?.folder || [])]
    }
    return flds?.join('/')
  }, [props?.initialFolder, query.folder])

  // TODO make it reusable
  const selectedFiles = useHookstate(selectedFilesState)
  const files = selectedFiles.get({
    noproxy: true
  })
  const selectFiles = () => {
    if (!props?.Key) return
    // update selected files state

    // if the clicked item is not selected, then select it
    if (!files?.[Key] && !commandHeld) {
      selectedFiles.set({
        [props?.Key]: props
      })
    } else {
      // if the item is already selected, then unselect it
      if (files?.[Key]) {
        const selected = Object.assign({}, files)
        delete (selected as any)?.[Key]
        selectedFiles.set(selected)
      } else {
        // if the item is not selected, then select it
        selectedFiles.merge({
          [props?.Key]: props
        })
      }
    }
  }

  return (
    <div
      onClick={selectFiles}
      onContextMenu={(evt) => handleFileManagerClick('file', evt, props, folders)}
      className={clsx(
        'relative z-0 flex flex-wrap items-center justify-center h-48 px-1 pt-2 text-center border-2 border-transparent border-dashed rounded-lg cursor-pointer select-none sm:h-56 lg:h-60 hover:bg-secondary',
        files?.[Key] && 'bg-secondary'
      )}>
      <div className="w-full">
        <div className="relative mx-auto">
          {Url && isPreviewable(Url) ? (
            <div className="relative inline-block h-24 mb-4 w-28 lg:h-28 lg:w-36">
              <Image src={Url} layout="fill" className="object-cover rounded-lg shadow-lg pointer-events-none" />
            </div>
          ) : (
            <div className="relative w-16 mx-auto">
              {/* If there's no File icon */}
              <DefaultFileThumbnail filename={Url} />
            </div>
          )}
          {/* Folder information such as files count, created at and title. */}
          <div className="text-center">
            <p className="inline-block w-full overflow-x-hidden text-sm font-bold leading-3 tracking-tight text-ellipsis whitespace-nowrap md:px-6">
              {Key}
            </p>
            <div className="flex items-center justify-center">
              <span className="flex flex-col text-xs text-gray-500 dark:text-gray-500">
                <p className="flex justify-center space-x-1">
                  <FiLink className="text-primary" />
                  <span>{formatBytes(Size)},</span>
                </p>
                <span className="hidden lg:inline-block">{moment(LastModified).format('DD. MMM. YYYY, HH:mm')}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
