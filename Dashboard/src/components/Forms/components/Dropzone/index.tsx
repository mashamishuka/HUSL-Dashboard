import clsx from 'clsx'
import { useCallback, useEffect, useState } from 'react'
import ReactDropzone from 'react-dropzone'
import { MdCloudUpload } from 'react-icons/md'
import { toast } from 'react-toastify'
import { useBeforeUnload } from 'react-use'

import { PreviewFileModal } from '@components/Modals'
import api from '@services/api'
import { formatBytes } from '@utils/index'

import type { HTMLProps } from 'react'
interface DropzoneProps extends Omit<HTMLProps<HTMLInputElement>, 'accept'> {
  label?: string
  maxFileSize?: number // default 10mb:10485760
  current?: any
  onChange?: (file: any) => void
  onBlur?: (file: any) => void
  value?: string
  values?: string[]
  setFieldValue?: (field?: any, name?: any, shouldValidate?: boolean) => void
  accept?: {
    [key: string]: string[]
  }
  compact?: boolean
  maxFiles?: number
  returnObject?: string
}

const Loading: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <svg
    className={clsx('w-8 h-8 mx-auto text-gray-500 animate-spin', compact ? 'w-5 h-5' : 'w-8 h-8')}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
)

const initialUploadState = {
  count: 0,
  uploading: false,
  uploaded: false,
  error: false,
  data: null
}

// prettier-ignore
type InitialUploadState = {
  count: number
  uploading: boolean
  uploaded: boolean
  error?: boolean
  data?: {
    id: number | string
  } | null
  dataArray?:
  | {
    id: number | string
  }[]
  | null
}

const Label: React.FC<{ error?: boolean; file?: any; current?: any }> = ({ error, file, current }) => {
  if (!error && file?.name) {
    return <span>{file?.name}</span>
  } else if (current && typeof current !== 'string') {
    if (current?.length > 0) {
      return current?.map((c: any, i: number) => <span key={i}>{c?.name || current?.key?.split('/')?.pop()}</span>)
    }
    return <span>{current?.name || current?.key?.split('/')?.pop()}</span>
  } else {
    return <span>Choose, or drag and drop your file here</span>
  }
}
export const Dropzone: React.FC<DropzoneProps> = ({
  label,
  name,
  maxFileSize = 10485760 * 4000, // 4GB
  current,
  value,
  setFieldValue,
  accept,
  compact,
  multiple,
  maxFiles,
  returnObject = '_id',
  ...rest
}) => {
  const [previewModal, setPreviewModal] = useState(false)
  const [fileState, setFileState] = useState<File>()
  const [uploadState, setUploadState] = useState<InitialUploadState>(initialUploadState)
  const uploading = useCallback(() => {
    if (uploadState?.count > 0 && !uploadState?.uploaded) {
      return true
    } else {
      return false
    }
  }, [uploadState])

  useBeforeUnload(uploading, 'You have unsaved changes, are you sure?')

  const uploadToServer = async (file?: any) => {
    const body = new FormData()
    body.append('file', file)
    return await api
      .post('/files/upload', body)
      .then(({ data }) => data?.data)
      .catch(() => null)
  }

  /**
   * TODO: Also handle multiple upload
   */
  const onDrop = useCallback(async (acceptedFiles: File[], reject) => {
    if (reject?.length > 0) {
      toast.error('Please select a valid file.')
      return
    }
    if (!multiple) {
      const file = acceptedFiles[0]
      if (file?.size === 0) {
        toast.error('File corrupt, please choose another file.')
        return
      }
      if (file?.size > maxFileSize) {
        toast.error('Please choose file less than ' + formatBytes(maxFileSize, 0))
        return
      }
      setUploadState({
        uploading: true,
        count: acceptedFiles?.length,
        uploaded: false,
        error: false,
        data: null,
        dataArray: []
      })
      const fileResponse = await uploadToServer(file)

      // set field value
      setFieldValue?.(name, fileResponse?.[returnObject])

      setFileState(file)
      setUploadState({
        uploading: false,
        count: acceptedFiles?.length,
        uploaded: false,
        error: false,
        data: fileResponse,
        dataArray: [fileResponse]
      })
    } else {
      const files = acceptedFiles
      // loop and upload files
      const fileResponse = await Promise.all(
        files.map(async (file) => {
          if (file?.size === 0) {
            toast.error('File corrupt, please choose another file.')
            return
          }
          if (file?.size > maxFileSize) {
            toast.error('Please choose file less than ' + formatBytes(maxFileSize, 0))
            return
          }
          setUploadState({
            uploading: true,
            count: acceptedFiles?.length,
            uploaded: false,
            error: false,
            data: null,
            dataArray: []
          })
          const fileResponse = await uploadToServer(file)
          return fileResponse
        })
      )
      setUploadState({
        uploading: false,
        count: acceptedFiles?.length,
        uploaded: false,
        error: false,
        dataArray: fileResponse
      })
      // set field value
      setFieldValue?.(
        name,
        fileResponse?.map((file) => file?.[returnObject])
      )
    }
  }, [])

  useEffect(() => {
    if (current) {
      setUploadState({
        ...uploadState,
        data: current,
        dataArray: current?.length > 0 ? current : [current]
      })
    }
  }, [current])

  // useEffect(() => {
  //   if (value) {
  //     setFieldValue?.(name, value)
  //   }
  // }, [value])
  return (
    <div className="flex flex-col w-full space-y-1">
      {label && (
        <label className={clsx('mb-px font-light', !compact ? 'text-sm' : 'text-xs')}>
          {label} {rest?.required && <span className="text-red-600">*</span>}
        </label>
      )}
      <ReactDropzone onDrop={onDrop} accept={accept} multiple={multiple} maxFiles={maxFiles}>
        {({ getRootProps, getInputProps }) => (
          <div
            className={clsx(
              compact
                ? 'inline-flex items-center space-x-3 border border-dashed p-3 max-w-sm rounded-xl cursor-pointer border-gray-600'
                : 'relative inline-flex flex-col items-center max-w-xs px-5 py-8 space-y-2 text-center border-2 border-white border-dashed cursor-pointer border-opacity-30 rounded-xl'
            )}
            {...getRootProps()}>
            {(uploadState?.data || value) && <input type="hidden" name={name} value={value} />}
            <input {...getInputProps()} />
            {uploadState?.uploading ? (
              <Loading compact={compact} />
            ) : (
              <MdCloudUpload className={clsx('text-primary', compact ? 'text-2xl' : 'text-4xl')} />
            )}
            <span className="text-sm">
              {uploadState?.uploading ? (
                <span>Uploading {uploadState?.count} file(s)</span>
              ) : (
                <Label
                  error={uploadState?.error}
                  // prettier-ignore
                  file={
                    multiple
                      ? {
                        ...fileState,
                        name: `${uploadState?.dataArray?.length || 0} files selected`,
                        size: 1
                      }
                      : fileState
                  }
                  current={current}
                />
              )}
            </span>
            {accept && !compact && (
              <span className="block text-xs text-gray-500">
                {Object.keys(accept)?.join(',')?.replace('/*', '')} up to {formatBytes(maxFileSize)}
              </span>
            )}
            {value && <span></span>}
          </div>
        )}
      </ReactDropzone>
      {current && (
        <div className="flex space-x-2">
          {typeof current === 'string' && (
            <a href={current} className="text-sm text-gray-400 underline" target="_blank">
              See current file
            </a>
          )}
          {typeof current !== 'string' &&
            current?.length > 0 &&
            current?.map((c: any, key: number) => (
              <a key={key} href={c?.url} className="text-sm text-gray-400 underline" target="_blank">
                {key + 1} - See File
              </a>
            ))}
          {!current?.length && typeof current !== 'string' && current && (
            <button
              type="button"
              onClick={() => setPreviewModal(true)}
              className="text-sm text-left text-gray-400 underline">
              See current file
            </button>
          )}
        </div>
      )}
      <PreviewFileModal open={previewModal} onClose={() => setPreviewModal(false)} data={current} />
    </div>
  )
}
