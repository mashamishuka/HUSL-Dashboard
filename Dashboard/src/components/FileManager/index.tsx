import { useLockBodyScroll } from 'react-use'
import { ActionHeader } from './ActionHeader'
import { ManagerLayout } from './Layouts'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import qs from 'qs'
import { GET_FOLDER_TREE } from '@src/restapi/fileManagers/constants'
import { Loading } from '@components/Icons'
import { useEffect, useMemo } from 'react'
import { useHookstate } from '@hookstate/core'
import { fetchUrlState } from '@states/fileManagers/fetchUrl'
import { searchQueryState } from '@states/fileManagers/searchQuery'

interface FileManagerProps {
  initialFolder?: string
  except?: string
  title?: string
}
export const FileManager: React.FC<FileManagerProps> = ({ initialFolder, except, title = 'Marketing Graphics' }) => {
  const fetchUrl = useHookstate(fetchUrlState)
  const searchQuery = useHookstate(searchQueryState)

  const { query } = useRouter()
  let folder = query.folder as string[]
  if (initialFolder) {
    // push initial folder into first array of folder
    folder = [initialFolder, ...(folder || [])]
  }
  const queries = qs.stringify(
    {
      folder: folder?.join('/') || null,
      search: searchQuery.get()
    },
    { skipNulls: true }
  )

  const { data: folders, error } = useSWR<RestApi.Response<FileManager.FolderTree>>(fetchUrl.get() || null)

  const data = useMemo(() => {
    if (!folders?.data?.folders) return null
    return {
      folders: folders?.data?.folders?.filter((folder) => {
        if (!except) return true
        return !except.includes(folder?.Prefix)
      }),
      files: folders?.data?.files
    }
  }, [folders, folder])
  // lock body scroll
  useLockBodyScroll(true)

  useEffect(() => {
    fetchUrl.set(`${GET_FOLDER_TREE}?${queries}`)

    return () => {
      fetchUrl.set('')
    }
  }, [queries, searchQuery.get()])

  return (
    <div className="flex flex-col space-y-3">
      <ActionHeader title={title} initialFolder={initialFolder} />
      {/* File manager files & folders list/grid */}
      {!error && !data ? (
        <div
          className="flex items-center justify-center"
          style={{
            height: 'calc(100vh - 18rem)'
          }}>
          <Loading size={28} />
        </div>
      ) : (
        <ManagerLayout files={data?.files} folders={data?.folders} initialFolder={initialFolder} />
      )}
    </div>
  )
}
