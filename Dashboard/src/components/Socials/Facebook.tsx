import { Facebook as FacebookIcon } from '@components/Icons'
import { SocialProps } from '.'

export const Facebook: React.FC<SocialProps> = ({ username }) => {
  return (
    <a href={`https://facebook.com/${username}`} target="_blank">
      <FacebookIcon />
    </a>
  )
}
