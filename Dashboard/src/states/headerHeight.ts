import { hookstate } from '@hookstate/core'

type headerHeightState = number

export const headerHeightState = hookstate<headerHeightState>(120)
