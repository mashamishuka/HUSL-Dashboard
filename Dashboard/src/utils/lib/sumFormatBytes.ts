import { formatBytes } from './formatBytes'

export const sumFormatBytes = (bytes: number[], decimals = 2) => {
  // sum all bytes
  const sum = bytes.reduce((a, b) => a + b, 0)

  return formatBytes(sum, decimals)
}
