import { Instagram as InstagramIcon } from '@components/Icons'
import { SocialProps } from '.'

export const Instagram: React.FC<SocialProps> = ({ username }) => {
  return (
    <a href={`https://instagram.com/${username}`} target="_blank">
      <InstagramIcon />
    </a>
  )
}
