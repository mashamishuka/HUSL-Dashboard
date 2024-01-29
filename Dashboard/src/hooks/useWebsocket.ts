import { useEffect, useState } from 'react'
import socketIO, { Socket } from 'socket.io-client'

import { useMe } from '@hooks/useMe'

// const loremNotifications = [
//   { id: 234, message: 'Jane and 5 others liked your post', timestamp: '10 min ago' },
//   { id: 235, message: 'John commented on your post', timestamp: '1 hour ago' },
//   { id: 236, message: 'Sarah sent you a message', timestamp: '2 hours ago' }
// ]

export const useWebSocket = () => {
  const [notifications, setNotifications] = useState<any[]>([])
  const [socket, setSocket] = useState<Socket | null>(null)
  const { me } = useMe()

  useEffect(() => {
    // Initialize Socket.io
    const iosocket = socketIO('http://localhost:1337', {
      query: {
        _id: me?._id
      }
    })

    // Add Socket.io event listeners or emit events
    iosocket.on('connect', () => {
      console.log('Connected to websocket server')
    })

    iosocket.on('message', (data) => {
      setNotifications([...notifications, data])
    })

    iosocket.on('private-event', (data) => {
      console.log(`Received room event: ${data.message}`)
    })

    setSocket(iosocket)

    return () => {
      // Clean up Socket.io connection if necessary
      iosocket.disconnect()
    }
  }, [me?._id, notifications])

  const removeNotification = (id: string) => {
    setNotifications((notifications) => notifications.filter((item) => item.id !== id))
  }
  return { socket, notifications, removeNotification }
}
