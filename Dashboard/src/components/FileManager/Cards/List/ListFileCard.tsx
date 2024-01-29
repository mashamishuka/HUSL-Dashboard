import { handleFileManagerClick } from '@components/FileManager/actions/handleFileManagerClick'
import { SmallFileThumbnail } from '@components/FileManager/Misc'
import { useCommandHeld } from '@hooks/useCommandHeld'
import { useHookstate } from '@hookstate/core'
import { selectedFilesState } from '@states/fileManagers/selectedFiles'
import { formatBytes } from '@utils/index'
import clsx from 'clsx'
import moment from 'moment'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
interface ListFileCardProps extends FileManager.File {
  initialFolder?: string
}
export const ListFileCard: React.FC<ListFileCardProps> = (props) => {
  const { Size, Key, LastModified, Url } = props
  const commandHeld = useCommandHeld()
  const { query } = useRouter()
  const folders = useMemo(() => {
    let flds = query?.folder as string[]
    // add initial folder to the first array of folder
    if (props?.initialFolder) {
      flds = [props?.initialFolder, ...(query?.folder || [])]
    }
    return flds?.join('/')
  }, [props?.initialFolder, query.folder])

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
        'flex items-center py-2 border-2 border-transparent border-dashed cursor-pointer select-none rounded-xl px-2.5 hover:bg-secondary',
        files?.[Key] && 'bg-secondary'
      )}>
      <div className="relative w-16 shrink-0">
        <div className="text-primary">
          {Url ? (
            <div className="object-cover w-12 h-12 rounded pointer-events-none ml-0.5">
              <Image src={Url} layout="fill" className="object-cover rounded-lg shadow-lg pointer-events-none" />
            </div>
          ) : (
            <div className="relative w-16 mx-auto">
              {/* If there's no File icon */}
              <SmallFileThumbnail />
            </div>
          )}
        </div>
      </div>
      <div className="pl-3">
        <span className="block overflow-hidden text-sm font-bold mb-0.5 text-ellipsis whitespace-nowrap">{Key}</span>
        <div className="flex items-center">
          <span className="block text-xs text-gray-500 dark:text-gray-500">
            {formatBytes(Size)}, {moment(LastModified).format('DD. MMM. YYYY, HH:mm')}
          </span>
        </div>
      </div>
    </div>
  )
}
