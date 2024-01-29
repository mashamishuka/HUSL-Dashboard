import { IconAction } from '@components/Button'
import { Search } from '@components/Forms/components'
import { useHookstate } from '@hookstate/core'
import { layoutTypeState } from '@states/fileManagers/layoutType'
import { selectedFilesState } from '@states/fileManagers/selectedFiles'
import { useMemo, useState } from 'react'
import { FiInfo, FiLink, FiTrash2 } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { useCopyToClipboard, useDebounce } from 'react-use'
import { UploadFile } from './UploadFile'
import { confirm } from '@components/ConfirmationBox'
import { deleteFiles } from '@src/restapi/fileManagers/mutation'
import { useRouter } from 'next/router'
import { fetchUrlState } from '@states/fileManagers/fetchUrl'
import { mutate } from 'swr'
import { searchQueryState } from '@states/fileManagers/searchQuery'
import { ViewAction } from './ViewAction'

interface UploadActionProps {
  initialFolder?: string
}
export const UploadAction: React.FC<UploadActionProps> = ({ initialFolder }) => {
  const { query } = useRouter()
  const layoutType = useHookstate(layoutTypeState)

  const selectedFiles = useHookstate(selectedFilesState)
  const fetchUrl = useHookstate(fetchUrlState)
  const [searchString, setSearchString] = useState<string>('')
  const searchQuery = useHookstate(searchQueryState)

  const [, copyToClipboard] = useCopyToClipboard()

  useDebounce(
    () => {
      if (searchString) {
        searchQuery.set(searchString)
      } else {
        searchQuery.set(null)
      }
    },
    1000,
    [searchString]
  )

  const filesCount = useMemo(() => {
    return Object.keys(selectedFiles.get() || []).length
  }, [selectedFiles])

  const files = useMemo(() => {
    const values = Object.values(selectedFiles.get() || {})
    let folders = (query?.folder as string[])?.join('/')
    if (folders) {
      folders = folders + '/'
    } else {
      folders = ''
    }
    return values.filter((v) => v.Key).map((file) => folders + file.Key)
  }, [selectedFiles])

  const handleCopyToClipboard = () => {
    const urls = Object.values(selectedFiles.get() || {})
      .filter((v) => v.Url)
      .map((v) => v.Url)
      .join(', ')
    if (urls) {
      copyToClipboard(urls)
      toast.success('Link copied to clipboard!')
    } else {
      toast.error('File url not found, please try again later.')
    }
  }
  const handleDeleteFiles = async () => {
    const confirmation = await confirm(`Are you sure you want to delete ${filesCount} file(s)?`)
    if (!confirmation) return
    const deletes = await deleteFiles(files)
    if (deletes) {
      toast.success('File(s) deleted successfully!')
      mutate(fetchUrl.get())
    } else {
      toast.error('Something went wrong, please try again later.')
    }
  }

  return (
    <div className="flex items-center w-full space-x-3 md:space-x-5">
      {/* <UploadDropdown /> */}
      <UploadFile initialFolder={initialFolder} />
      <Search
        iconSize={18}
        className="text-sm"
        placeholder="Search files..."
        onChange={(evt) => setSearchString(evt.currentTarget?.value)}
        value={searchString}
        onKeyPress={(evt) => {
          if (evt.key === 'Enter') {
            searchQuery.set(evt.currentTarget.value)
          }
        }}
      />
      <div className="flex items-center">
        <IconAction onClick={handleCopyToClipboard} disabled={filesCount === 0}>
          <FiLink />
        </IconAction>
        <IconAction onClick={handleDeleteFiles} disabled={filesCount === 0}>
          <FiTrash2 />
        </IconAction>
      </div>
      <div className="flex items-center">
        <ViewAction />
        <IconAction
          onClick={() =>
            layoutType.set({
              type: layoutType?.get()?.type === 'compact' ? 'full' : 'compact'
            })
          }
          className={layoutType?.get()?.type === 'compact' ? 'text-primary' : ''}>
          <FiInfo />
        </IconAction>
      </div>
    </div>
  )
}
