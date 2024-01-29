export const getFilePrefix = (filename: string) => {
  if (filename?.endsWith('/')) {
    return filename?.replace('/', '')
  } else {
    return filename
  }
}
