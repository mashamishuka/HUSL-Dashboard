const WEBHUSL_PUBLIC_URL = process.env.WEBHUSL_PUBLIC_URL || 'https://web.husl.app/public'
const WEBHUSL_API_URL = process.env.WEBHUSL_API_URL || 'https://web.husl.app/api/v1'

const WEBHUSL_API_MASTER_KEY =
  process.env.WEBHUSL_API_MASTER_KEY || 'vG2jmq9841FjSgfVUJtx0R4rlEyCSBe45yFjKYGC7pFmlikAxWma6A1ZBQHq'

export const huslWebEditorPublicUrl = (code: string) => {
  return `${WEBHUSL_PUBLIC_URL}/landingpages/builder/public/${code}?token=${WEBHUSL_API_MASTER_KEY}`
}

export const huslWebPublicUrl = (code: string) => {
  return `${WEBHUSL_API_URL}/landingpages/${code}`
}

export const huslWebName = (items?: any[], code?: string) => {
  return items?.filter((v) => v?.value === code)[0]?.label || code
}

export const huslWebUrl = (items?: any[], code?: string) => {
  const filterDomain = items?.filter((v) => v?.value === code)?.[0]
  if (filterDomain?.custom_domain || filterDomain?.sub_domain) {
    return `https://${filterDomain?.custom_domain || filterDomain?.sub_domain}`
  } else {
    return `${WEBHUSL_API_URL}/landingpages/${code}`
  }
}
