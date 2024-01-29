import { useMemo } from 'react'
import { MainLayout } from '@components/Layouts/MainLayout'
import { useBusiness } from '@hooks/useBusiness'
import { Tooltip } from 'react-tooltip'

import { useCopyToClipboard } from 'react-use'
import { toast } from 'react-toastify'
import { getTagCopies, replaceBulk } from '@utils/index'

import Image from 'next/image'

import type { NextLayoutComponentType } from 'next'
import { MdDownload, MdFileCopy } from 'react-icons/md'
import { useActiveBusiness } from '@hooks/useActiveBusiness'

const AdMaterialPage: NextLayoutComponentType = () => {
  const { business: activeBusiness } = useActiveBusiness()
  const { data: business } = useBusiness(activeBusiness?._id)
  const [, copyToClipboard] = useCopyToClipboard()
  const { copyFrom, copyTo } = getTagCopies(business?.data)

  const mobileAds = useMemo(() => {
    const ads = business?.data?.generatedGraphics?.filter((g) => g.key?.endsWith('-ads.png'))
    return ads
  }, [business?.data?.generatedGraphics])

  const handleCopyToClipboard = (text?: string) => {
    if (!text) return
    copyToClipboard(text)
    toast.success('Copied to clipboard')
  }
  const downloadImage = (file?: FileManager.FileResponse) => {
    const url = file?.url
    const key = file?.key?.split('/').pop()
    if (!url || !key) return
    const link = document.createElement('a')
    link.href = url
    link.download = key
    link.click()
  }

  return (
    <div className="flex flex-col py-6 space-y-5">
      <h1 className="text-xl">Ad Materials</h1>
      <div className="grid grid-cols-2 gap-x-5">
        <div className="flex flex-col space-y-3">
          {mobileAds?.map((ads, i) => (
            <div key={i} className="relative w-full p-2 rounded-lg bg-secondary">
              <div className="relative w-full overflow-hidden rounded-lg h-80">
                {ads?.url && (
                  <>
                    <div
                      className="rounded-lg"
                      style={{
                        backgroundImage: `url(${ads.url})`,
                        height: '100%',
                        width: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(40px)'
                      }}></div>
                    <div className="flex items-center justify-center w-full h-full">
                      <Image src={ads.url} layout="fixed" objectFit="contain" width={150} height={280} className="z-10 " />
                    </div>
                  </>
                )}
              </div>
              <div className="relative flex items-center justify-between px-2 py-3 text-sm">
                <div className="flex flex-col space-y-1">
                  <h3 className="font-medium">{ads?.key?.split('/')?.pop()}</h3>
                  {/* <span className="flex items-center space-x-2 text-xs font-light text-white text-opacity-50">
                    <ImFileEmpty />
                    <span>Created {moment(business?.data?.createdBy).fromNow()}</span>
                  </span> */}
                </div>
                <div className="flex items-center space-x-2">
                  <Tooltip anchorId={`download-tooltip-${i}`} content="Download" place="left" variant="light" />
                  <Tooltip
                    anchorId={`copy-tooltip-${i}`}
                    content="Copy Link To Clipboard"
                    place="top"
                    className="z-50"
                    variant="light"
                  />
                  <button
                    id={`download-tooltip-${i}`}
                    onClick={() => downloadImage(ads)}
                    className="relative p-1 text-lg rounded bg-dark hover:bg-gray-800">
                    <MdDownload />
                  </button>
                  <button
                    id={`copy-tooltip-${i}`}
                    onClick={() => handleCopyToClipboard(ads?.url)}
                    className="relative p-1 text-lg rounded bg-dark hover:bg-gray-800">
                    <MdFileCopy />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col space-y-3">
          <div className="flex flex-col space-y-3">
            <div className="relative flex flex-col w-full p-3 space-y-1 rounded-lg bg-secondary">
              <label className="font-semibold">Short Ad Copy</label>
              <Tooltip anchorId="shortAdCopy-tooltip" content="Click to copy" place="top" variant="light" />
              <span
                id="shortAdCopy-tooltip"
                onClick={() => handleCopyToClipboard(replaceBulk(business?.data?.product?.shortAdCopy, copyFrom, copyTo))}
                className="text-sm text-gray-200 whitespace-pre-line cursor-pointer hover:underline">
                {replaceBulk(business?.data?.product?.shortAdCopy, copyFrom, copyTo)}
              </span>
            </div>
          </div>
          <div className="flex flex-col space-y-3">
            <div className="relative flex flex-col w-full p-3 space-y-1 rounded-lg bg-secondary">
              <label className="font-semibold">Long Ad Copy</label>
              <Tooltip anchorId="longAdCopy-tooltip" content="Click to copy" place="top" variant="light" />
              <span
                id="longAdCopy-tooltip"
                onClick={() => handleCopyToClipboard(replaceBulk(business?.data?.product?.longAdCopy, copyFrom, copyTo))}
                className="text-sm text-gray-200 whitespace-pre-line cursor-pointer hover:underline">
                {replaceBulk(business?.data?.product?.longAdCopy, copyFrom, copyTo)}
              </span>
            </div>
          </div>
          <div className="flex flex-col space-y-1">
            <div className="flex space-x-3">
              <span className="font-bold underline">Headline:</span>
              <span>{replaceBulk('[motivation]', copyFrom, copyTo)}</span>
            </div>
            <div className="flex space-x-3">
              <span className="font-bold underline">Description:</span>
              <span>{replaceBulk('[niche] app within minutes.', copyFrom, copyTo)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

AdMaterialPage.getLayout = function getLayout(page) {
  return <MainLayout children={page} />
}

export default AdMaterialPage
