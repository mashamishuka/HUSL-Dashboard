import dynamic from 'next/dynamic'
import type { NextLayoutComponentType } from 'next'

const ImageEditor = dynamic(() => import('@components/Editor/ImglyImageEditor'), {
  ssr: false
})

const ImageEditorPage: NextLayoutComponentType = () => {
  return <ImageEditor />
}

export default ImageEditorPage
