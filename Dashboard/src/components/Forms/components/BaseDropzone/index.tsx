import { useCallback, useState } from 'react'
import ReactDropzone from 'react-dropzone'
import { toast } from 'react-toastify'

import clsx from 'clsx'
import { formatBytes } from '@utils/index'
import { MdCloudUpload } from 'react-icons/md'
import type { HTMLProps } from 'react'

interface BaseDropzoneProps extends Omit<HTMLProps<HTMLInputElement>, 'accept' | 'onDrop'> {
  label?: string
  maxFileSize?: number // default 10mb:10485760
  onChange?: (file: any) => void
  onBlur?: (file: any) => void
  value?: string
  values?: string[]
  accept?: {
    [key: string]: string[]
  }
  compact?: boolean
  maxFiles?: number
  onDrop?: (acceptedFiles: File[]) => void
  hint?: React.ReactNode | string
}

const initialUploadState = {
  count: 0,
  data: null
}
// prettier-ignore
type InitialUploadState = {
  count: number
  files?: File[]
}
export const BaseDropzone: React.FC<BaseDropzoneProps> = ({
  label,
  maxFileSize = 10485760,
  value,
  accept,
  compact,
  multiple,
  maxFiles,
  onDrop: handleDrop,
  hint,
  ...rest
}) => {
  const [uploadState, setUploadState] = useState<InitialUploadState>(initialUploadState)

  const onDrop = useCallback(async (acceptedFiles: File[], reject) => {
    if (reject?.length > 0) {
      toast.error('Please select a valid file.')
      return
    }
    setUploadState({
      count: acceptedFiles?.length,
      files: acceptedFiles
    })
    handleDrop?.(acceptedFiles)
  }, [])

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
            <input {...getInputProps()} />
            <MdCloudUpload className={clsx('text-primary', compact ? 'text-2xl' : 'text-4xl')} />
            {accept && !compact && (
              <span className="block text-xs text-gray-500">
                {Object.keys(accept)?.join(',')?.replace('/*', '')} up to {formatBytes(maxFileSize)}
              </span>
            )}
            {compact && !uploadState?.files?.length && <span className="block text-sm text-gray-200">Choose File</span>}
            {compact && uploadState?.files?.length && (
              <span className="block text-sm text-gray-200">
                {uploadState?.files?.length} file{uploadState?.files?.length > 1 && 's'} selected
              </span>
            )}
            {value && <span></span>}
          </div>
        )}
      </ReactDropzone>
      {hint && <span className={clsx('text-xs font-light text-left')}>{hint}</span>}
    </div>
  )
}
