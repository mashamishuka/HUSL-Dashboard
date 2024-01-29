export const getExt = (path?: string) => {
  if (!path) return ''
  const ext = path.split('.').pop()
  if (!ext) return ''
  return ext
}
