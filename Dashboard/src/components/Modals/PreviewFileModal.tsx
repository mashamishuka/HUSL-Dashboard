import { Fragment, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { MdDownload, MdOutlinePreview, MdOutlineVpnKey, MdPictureAsPdf, MdTag } from 'react-icons/md'

import Image from 'next/image'
import { cutString, getExt, getFilename } from '@utils/index'
import { FiImage } from 'react-icons/fi'
import { BsBucket } from 'react-icons/bs'
import Button from '@components/Button'

interface PreviewFileModalProps {
  open?: boolean
  onClose?: () => void
  data?: FileManager.FileResponse
}
export const PreviewFileModal: React.FC<PreviewFileModalProps> = ({ open, onClose, data }) => {
  useEffect(() => {
    return () => {
      onClose?.()
    }
  }, [])
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={() => onClose && onClose()}>
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0">
            <Dialog.Overlay className="fixed inset-0 bg-opacity-50 bg-dark backdrop-blur-md" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95">
            <div className="relative inline-block w-full px-6 pt-6 pb-6 overflow-hidden text-left align-middle transition-all transform rounded-lg bg-secondary md:w-[490px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-3">
                    <MdOutlinePreview className="text-xl" />
                  </div>
                  <b className="text-base font-bold">File Preview</b>
                </div>
              </div>
              <div className="flex flex-col mt-5 space-y-3 lg:flex-row lg:space-y-0 lg:space-x-5">
                <div className="w-full mx-auto lg:w-1/2">
                  {data?.url && (
                    <Image
                      src={data?.url}
                      layout="responsive"
                      width={200}
                      height={200}
                      className="object-cover rounded-lg"
                    />
                  )}
                </div>
                <div>
                  <div className="flex flex-col items-start">
                    <div className="flex items-start flex-1">
                      <div className="mr-2 text-xl text-primary">
                        <MdOutlineVpnKey />
                      </div>
                      <div>
                        <b className="block overflow-hidden text-sm font-bold" title={data?.ETag?.replace(/"/g, '')}>
                          {data?._id}
                        </b>
                        <small className="block text-xs font-bold text-gray-400">File ID</small>
                      </div>
                    </div>
                    <div className="flex items-start flex-1 mt-3">
                      <div className="mr-2 text-xl text-primary">
                        {getExt(data?.url) === 'png' ||
                          getExt(data?.url) === 'jpg' ||
                          (getExt(data?.url) === 'jpeg' && <FiImage />)}
                        {getExt(data?.url) === 'pdf' && <MdPictureAsPdf />}
                      </div>
                      <div>
                        <b className="block overflow-hidden text-sm font-bold w-52 text-ellipsis whitespace-nowrap 2xl:w-72">
                          {getFilename(data?.url?.split('/')?.[data?.url?.split('/')?.length - 1])}
                        </b>
                        <small className="block text-xs font-bold text-gray-400">{getExt(data?.url)}</small>
                      </div>
                    </div>
                    <div className="flex items-start flex-1 mt-3">
                      <div className="mr-2 text-xl text-primary">
                        <MdTag />
                      </div>
                      <div>
                        <b className="block overflow-hidden text-sm font-bold" title={data?.ETag?.replace(/"/g, '')}>
                          {cutString(data?.ETag?.replace(/"/g, '') || '', 5, 15)}
                        </b>
                        <small className="block text-xs font-bold text-gray-400">ETag</small>
                      </div>
                    </div>
                    <div className="flex items-start flex-1 mt-3 ml-0.5">
                      <div className="mr-2 text-primary">
                        <BsBucket />
                      </div>
                      <div>
                        <b className="block overflow-hidden text-sm font-bold" title={data?.ETag?.replace(/"/g, '')}>
                          {data?.bucket}
                        </b>
                        <small className="block text-xs font-bold text-gray-400">Bucket</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <Button url={data?.url} target="_blank" variant="outline" size="sm" className="inline-flex items-center">
                  <MdDownload />
                  <span className="ml-2">Download</span>
                </Button>
              </div>

              <button type="button" className="absolute right-5 top-3" onClick={() => onClose && onClose()}>
                <XMarkIcon width={24} />
              </button>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}
