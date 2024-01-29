import Image from 'next/image'

interface AvatarProps {
  src?: string
  size?: number
  layout?: 'fixed' | 'fill' | 'intrinsic' | 'responsive' | undefined
}
export const Avatar: React.FC<AvatarProps> = ({ src, size = 40, layout }) => {
  if (!src) return <></>
  return <Image src={src} width={size} height={size} objectFit="cover" layout={layout} className="rounded-full" />
}
