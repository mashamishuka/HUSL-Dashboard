import { useBusiness } from '@hooks/useBusiness'
import { WarningAlert } from '@components/Alerts'
import { useMemo, Fragment } from 'react'
import Image from 'next/image'
import { MdContentCopy, MdDownload, MdOutlineVpnKey, MdPictureAsPdf, MdTag } from 'react-icons/md'
import { getExt, getFilename, getTagCopies, replaceBulk } from '@utils/index'
import { FiImage } from 'react-icons/fi'
import Button from '@components/Button'
import { useCopyToClipboard } from 'react-use'
import { toast } from 'react-toastify'
import { useActiveBusiness } from '@hooks/useActiveBusiness'

export const BrandOverview: React.FC = () => {
  const { business: activeBusiness } = useActiveBusiness()
  const { data } = useBusiness(activeBusiness?._id)
  const [, copyToClipboard] = useCopyToClipboard()
  const { copyFrom, copyTo } = getTagCopies(data?.data)

  const business = useMemo(() => {
    if (!data?.data) return null
    return data?.data
  }, [data])

  const downloadFile = (url?: string) => {
    if (!url) return
    const link = document.createElement('a')
    link.href = url
    link.download = 'Download.jpg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  const handleCopyToClipboard = (text?: string) => {
    if (!text) {
      toast.error('Nothing to copy.')
      return
    }
    copyToClipboard(text)
    toast.success('Copied to clipboard')
  }

  if (!business) {
    return (
      <div>
        <WarningAlert>You do not have any business yet.</WarningAlert>
      </div>
    )
  }
  return (
    <div className="flex flex-col space-y-5">
      {business?.logo?.url && (
        <div>
          <label className="block mb-2 semibold">Logo</label>
          <div className="flex flex-col p-3 space-y-3 rounded lg:flex-row lg:space-y-0 lg:space-x-5 bg-dark">
            <div className="flex items-center justify-center overflow-hidden rounded-md bg-secondary">
              <Image src={business?.logo?.url} width={200} height={150} className="object-contain rounded" />
            </div>
            <div className="w-6/12">
              <div className="flex flex-col items-start">
                <div className="flex items-start flex-1">
                  <div className="mr-2 text-xl text-primary">
                    <MdOutlineVpnKey />
                  </div>
                  <div>
                    <b className="block overflow-hidden text-sm font-bold" title={business?.logo?.ETag?.replace(/"/g, '')}>
                      {business?.logo?._id}
                    </b>
                    <small className="block text-xs font-bold text-gray-400">File ID</small>
                  </div>
                </div>
                <div className="flex items-start flex-1 mt-2">
                  <div className="mr-2 text-xl text-primary">
                    {(getExt(business?.logo?.url) === 'png' ||
                      getExt(business?.logo?.url) === 'jpg' ||
                      getExt(business?.logo?.url) === 'jpeg') && <FiImage />}
                    {getExt(business?.logo?.url) === 'pdf' && <MdPictureAsPdf />}
                  </div>
                  <div>
                    <b className="block overflow-hidden text-sm font-bold w-52 text-ellipsis whitespace-nowrap 2xl:w-72">
                      {getFilename(business?.logo?.url?.split('/')?.[business?.logo?.url?.split('/')?.length - 1])}
                    </b>
                    <small className="block text-xs font-bold text-gray-400">{getExt(business?.logo?.url)}</small>
                  </div>
                </div>
                <div className="flex items-start flex-1 mt-3">
                  <div className="mr-2 text-xl text-primary">
                    <MdTag />
                  </div>
                  <div>
                    <b className="block overflow-hidden text-sm font-bold" title={business?.logo?.ETag?.replace(/"/g, '')}>
                      {business?.logo?.ETag?.replace(/"/g, '')}
                    </b>
                    <small className="block text-xs font-bold text-gray-400">ETag</small>
                  </div>
                </div>
                {/* <hr className="w-full my-2 border-gray-700" /> */}
                <div className="flex items-center w-full mt-6 space-x-2">
                  <Button
                    size="sm"
                    onClick={() => downloadFile(business?.logo?.url)}
                    variant="outline"
                    className="px-2 border-gray-700 py-1.5">
                    <MdDownload />
                  </Button>
                  <Button
                    onClick={() => handleCopyToClipboard(business?.logo?.url)}
                    size="sm"
                    variant="outline"
                    className="px-2 border-gray-700 py-1.5">
                    <MdContentCopy />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {business?.favicon?.url && (
        <div>
          <label className="block mb-2 semibold">Icon</label>
          <div className="flex flex-col p-3 space-y-3 rounded lg:flex-row lg:space-y-0 lg:space-x-5 bg-dark">
            <div className="flex items-center justify-center overflow-hidden rounded-md bg-secondary">
              <Image src={business?.favicon?.url} width={200} height={150} className="object-contain rounded" />
            </div>
            <div className="w-6/12">
              <div className="flex flex-col items-start">
                <div className="flex items-start flex-1">
                  <div className="mr-2 text-xl text-primary">
                    <MdOutlineVpnKey />
                  </div>
                  <div>
                    <b
                      className="block overflow-hidden text-sm font-bold"
                      title={business?.favicon?.ETag?.replace(/"/g, '')}>
                      {business?.favicon?._id}
                    </b>
                    <small className="block text-xs font-bold text-gray-400">File ID</small>
                  </div>
                </div>
                <div className="flex items-start flex-1 mt-2">
                  <div className="mr-2 text-xl text-primary">
                    {(getExt(business?.favicon?.url) === 'png' ||
                      getExt(business?.favicon?.url) === 'jpg' ||
                      getExt(business?.favicon?.url) === 'jpeg') && <FiImage />}
                    {getExt(business?.favicon?.url) === 'pdf' && <MdPictureAsPdf />}
                  </div>
                  <div>
                    <b className="block overflow-hidden text-sm font-bold w-52 text-ellipsis whitespace-nowrap 2xl:w-72">
                      {getFilename(business?.favicon?.url?.split('/')?.[business?.favicon?.url?.split('/')?.length - 1])}
                    </b>
                    <small className="block text-xs font-bold text-gray-400">{getExt(business?.favicon?.url)}</small>
                  </div>
                </div>
                <div className="flex items-start flex-1 mt-3">
                  <div className="mr-2 text-xl text-primary">
                    <MdTag />
                  </div>
                  <div>
                    <b
                      className="block overflow-hidden text-sm font-bold"
                      title={business?.favicon?.ETag?.replace(/"/g, '')}>
                      {business?.favicon?.ETag?.replace(/"/g, '')}
                    </b>
                    <small className="block text-xs font-bold text-gray-400">ETag</small>
                  </div>
                </div>
                {/* <hr className="w-full my-2 border-gray-700" /> */}
                <div className="flex items-center w-full mt-6 space-x-2">
                  <Button
                    size="sm"
                    onClick={() => downloadFile(business?.favicon?.url)}
                    variant="outline"
                    className="px-2 border-gray-700 py-1.5">
                    <MdDownload />
                  </Button>
                  <Button
                    onClick={() => handleCopyToClipboard(business?.favicon?.url)}
                    size="sm"
                    variant="outline"
                    className="px-2 border-gray-700 py-1.5">
                    <MdContentCopy />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {(business?.primaryColor || business?.secondaryColor) && (
        <div>
          <label className="block mb-2 semibold">Brand Colors</label>
          <div className="flex space-x-5">
            <div
              onClick={() => handleCopyToClipboard(business?.primaryColor)}
              className="flex flex-col items-center justify-center w-full h-32 text-center rounded-md cursor-pointer hover:shadow-lg"
              style={{
                backgroundColor: business?.primaryColor || '#000'
              }}>
              <span>Primary Color</span>
              <span className="uppercase">{business?.primaryColor}</span>
            </div>
            <div
              onClick={() => handleCopyToClipboard(business?.secondaryColor)}
              className="flex flex-col items-center justify-center w-full h-32 text-center rounded-md cursor-pointer hover:shadow-lg"
              style={{
                backgroundColor: business?.secondaryColor || '#000'
              }}>
              <span>Secondary Color</span>
              <span className="uppercase">{business?.secondaryColor}</span>
            </div>
          </div>
        </div>
      )}
      <div>
        <label className="block mb-1 semibold">Welcome Text</label>
        <div
          onClick={() => handleCopyToClipboard(replaceBulk(business?.customFields?.welcomeText, copyFrom, copyTo))}
          className="text-sm text-white transition-all duration-150 cursor-pointer group text-opacity-80 hover:text-opacity-100">
          {replaceBulk(business?.customFields?.welcomeText, copyFrom, copyTo)}
          <MdContentCopy className="hidden ml-2 group-hover:inline" />
        </div>
      </div>
      <div>
        <label className="block mb-1 semibold">Social Media Bio</label>
        <div
          onClick={() => handleCopyToClipboard(replaceBulk(business?.customFields?.socialMediaBio, copyFrom, copyTo))}
          className="text-sm text-white transition-all duration-150 cursor-pointer group text-opacity-80 hover:text-opacity-100">
          {replaceBulk(business?.customFields?.socialMediaBio, copyFrom, copyTo)}
          <MdContentCopy className="hidden ml-2 group-hover:inline" />
        </div>
      </div>
      <div>
        <label className="block mb-1 semibold">My Customers</label>
        <div
          onClick={() =>
            handleCopyToClipboard(replaceBulk(business?.niche?.customFields?.myCustomersText, copyFrom, copyTo))
          }
          className="text-sm text-white transition-all duration-150 cursor-pointer group text-opacity-80 hover:text-opacity-100">
          {replaceBulk(business?.niche?.customFields?.myCustomersText, copyFrom, copyTo)}
          <MdContentCopy className="hidden ml-2 group-hover:inline" />
        </div>
      </div>
      <div>
        <label className="block mb-2 semibold">Suggested Hastags</label>
        <div className="flex flex-wrap -ml-2 space-x-2 space-y-2">
          {business?.niche?.suggestedHastags?.map((hastag, index) => (
            <Fragment key={index}>
              <div />
              {hastag?.split(' ')?.length > 0 ? (
                hastag?.split(' ').map((h, i) => (
                  <Button key={i} variant="outline" size="sm">
                    {h}
                  </Button>
                ))
              ) : (
                <Button key={index} variant="outline" size="sm">
                  {hastag}
                </Button>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}
