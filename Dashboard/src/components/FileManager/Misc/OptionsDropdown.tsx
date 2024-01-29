import { ComponentType, useRef, useState } from 'react'
import { ReactConfirmProps } from 'react-confirm'
import { useClickAway, useCopyToClipboard } from 'react-use'
import { FiDownloadCloud, FiEdit, FiEye, FiLink, FiTrash2 } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { deleteFile, deleteFolder } from '@src/restapi/fileManagers/mutation'
import { useHookstate } from '@hookstate/core'
import { fetchUrlState } from '@states/fileManagers/fetchUrl'
import { mutate } from 'swr'
import { confirm } from '@components/ConfirmationBox'
import { EditFileModal } from './EditFileModal'
import { layoutTypeState } from '@states/fileManagers/layoutType'
import { selectedFilesState } from '@states/fileManagers/selectedFiles'

interface OptionsDropdownProps {
  type?: 'folder' | 'file'
  style?: React.CSSProperties
  data?: FileManager.File & FileManager.Folder
  folder?: string
}

export const OptionsDropdown: ComponentType<ReactConfirmProps & OptionsDropdownProps> = ({ type, style, data, folder }) => {
  const dialogRef = useRef<HTMLUListElement>(null)
  const [, copyToClipboard] = useCopyToClipboard()
  const fetchUrl = useHookstate(fetchUrlState)
  const [editModal, setEditModal] = useState(false)
  const layoutType = useHookstate(layoutTypeState)
  const selectedFiles = useHookstate(selectedFilesState)

  useClickAway(dialogRef, () => {
    dialogRef?.current?.parentElement?.remove()
  })

  const handleCopyToClipboard = () => {
    if (data?.Url) {
      copyToClipboard(data.Url)
      toast.success('Link copied to clipboard!')
      dialogRef?.current?.parentElement?.remove()
    } else {
      toast.error('File url not found, please try again later.')
    }
  }
  console.log(folder)

  const handleDeleteFile = async () => {
    // direct hide the dialog
    dialogRef?.current?.parentElement?.remove()

    if (type === 'file') {
      if (!data?.Key) return
      // delete file
      const confirmation = await confirm(`Are you sure you want to delete this file?`)
      if (!confirmation) return
      const deletes = await deleteFile(data?.Key, folder)
      if (deletes) {
        toast.success('File deleted successfully!')
        mutate(fetchUrl.get())
      } else {
        toast.error('Something went wrong, please try again later.')
      }
    } else {
      if (!data?.Prefix) return
      // delete folder
      const confirmation = await confirm(`Are you sure you want to delete this folder?`)
      if (!confirmation) return
      let prefix = data?.Prefix
      if (prefix.endsWith('/')) {
        prefix = prefix.slice(0, -1)
      }
      toast.loading('Deleting folder...', {
        toastId: 'deleteFolder'
      })
      const deletes = await deleteFolder(prefix)
      if (deletes) {
        toast.update('deleteFolder', {
          render: 'Folder deleted successfully!',
          type: 'success',
          isLoading: false,
          autoClose: 5000
        })
        mutate(fetchUrl.get())
      } else {
        toast.update('deleteFolder', {
          render: 'Something went wrong, please try again later.',
          type: 'error',
          isLoading: false,
          autoClose: 5000
        })
      }
    }
  }

  const handleDownloadFile = () => {
    if (data?.Url) {
      dialogRef?.current?.parentElement?.remove()
      const link = document.createElement('a')
      link.href = data.Url
      link.download = 'Download.jpg'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      toast.error('File url not found, please try again later.')
    }
  }

  const handleFileDetailPreview = () => {
    if (!data?.Key) return
    dialogRef?.current?.parentElement?.remove()
    layoutType.set({
      type: 'compact',
      previewData: data
    })
    selectedFiles.set({
      [data?.Key]: data
    })
  }

  return (
    <div>
      <ul
        ref={dialogRef}
        className="z-30 flex flex-col justify-start w-56 py-1 overflow-auto text-base text-left rounded-lg bg-secondary shadow-frame ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm top-12 divide-opacity-50 optionDropdown"
        style={style}>
        {type === 'file' && (
          <li>
            <button
              onClick={() => setEditModal(true)}
              className="flex items-center w-full px-5 py-3 space-x-3 text-gray-300 hover:bg-dark hover:text-primary">
              <FiEdit className="text-lg" />
              <span>Edit</span>
            </button>
          </li>
        )}
        <li>
          <button
            onClick={handleDeleteFile}
            className="flex items-center w-full px-5 py-3 space-x-3 text-gray-300 hover:bg-dark hover:text-primary">
            <FiTrash2 className="text-lg" />
            <span>Delete</span>
          </button>
        </li>
        {type === 'file' && (
          <li>
            <button
              onClick={handleCopyToClipboard}
              className="flex items-center w-full px-5 py-3 space-x-3 text-gray-300 hover:bg-dark hover:text-primary">
              <FiLink className="text-lg" />
              <span>Share</span>
            </button>
          </li>
        )}
        {type === 'file' && (
          <li>
            <button
              onClick={handleFileDetailPreview}
              className="flex items-center w-full px-5 py-3 space-x-3 text-gray-300 hover:bg-dark hover:text-primary">
              <FiEye className="text-lg" />
              <span>Detail</span>
            </button>
          </li>
        )}
        {type === 'file' && (
          <li>
            <button
              onClick={handleDownloadFile}
              className="flex items-center w-full px-5 py-3 space-x-3 text-gray-300 hover:bg-dark hover:text-primary">
              <FiDownloadCloud className="text-lg" />
              <span>Download</span>
            </button>
          </li>
        )}
      </ul>
      <EditFileModal data={data} open={editModal} onClose={() => setEditModal(false)} folder={folder} />
    </div>
  )
}
