import { useEffect, useState } from 'react'

export const NoSSR: React.FC = ({ children }) => {
  const [isMounted, setMount] = useState(false)

  useEffect(() => {
    setMount(true)
  }, [])

  return <>{isMounted ? children : null}</>
}

export default NoSSR
