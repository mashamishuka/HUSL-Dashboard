import { useState, useEffect } from 'react'

export const useClientOnly = () => {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    setLoaded(true)
    return () => {
      setLoaded(false)
    }
  }, [])
  return loaded
}
