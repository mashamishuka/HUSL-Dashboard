const WEBHUSL_URL = process.env.WEBHUSL_URL || 'https://web.husl.app'

export const huslWebStorageUrl = (path: string) => {
  return `${WEBHUSL_URL}/storage${path}`
}
