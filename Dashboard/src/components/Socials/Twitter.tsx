import { Twitter as TwitterIcon } from '@components/Icons'
import { SocialProps } from '.'

export const Twitter: React.FC<SocialProps> = ({ username }) => {
  return (
    <a href={`https://twitter.com/${username}`} target="_blank">
      <TwitterIcon />
    </a>
  )
}
