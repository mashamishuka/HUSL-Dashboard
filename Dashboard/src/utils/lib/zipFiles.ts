export const zipFiles = async (files: any[]) => {
  // get the ZIP stream in a Blob
  const { downloadZip } = await import('client-zip')
  const blob = await downloadZip(files).blob()
  return blob
}
