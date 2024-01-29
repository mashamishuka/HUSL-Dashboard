export const isPreviewable = (filename: string) => {
  const exts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'tif', 'jfif', 'pjpeg', 'pjp']
  const fileExt = filename.split('.').pop()
  if (!fileExt) return false
  return exts.includes(fileExt)
}
