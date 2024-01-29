import { Tiktok as TiktokIcon } from '@components/Icons'
import { SocialProps } from '.'

export const Tiktok: React.FC<SocialProps> = ({ username }) => {
  return (
    <a href={`https://tiktok.com/${username}`} target="_blank">
      <TiktokIcon />
    </a>
  )
}
