import { hookstate } from '@hookstate/core'

type MailCountState = number

export const mailCountState = hookstate<MailCountState>(0)
