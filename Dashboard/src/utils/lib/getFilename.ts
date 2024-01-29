import { getExt } from './getExt'

/**
 * Get filename, remove extension
 */
export const getFilename = (filename?: string) => {
  const ext = getExt(filename)
  return filename?.replace(`.${ext}`, '')
}
