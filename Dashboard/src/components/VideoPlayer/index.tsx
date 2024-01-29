import ReactPlayer from 'react-player'

interface VideoPlayerProps {
  src: string
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {
  return (
    <div className="video-player">
      <ReactPlayer className="react-player" url={src} width="100%" height="100%" controls />
    </div>
  )
}
