export type Notification = {
  _id: string
  name: NotificationName[]
  title: string
  message: string
  content?: string
  type: string
  timestamp: number
  createdAt: number
  status?: boolean
}

type NotificationName = {
  label: string
  value: string
}
