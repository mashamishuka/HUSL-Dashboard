interface GAnalyticConfig {
  _id: string
  propertyId: string
  clientId: string
  user?: string
  gaToken?: string
  pageViews?: {
    data?: {
      month: number
      monthShort: string
      pageViews: number
    }[]
    lastUpdatedAt?: Date | string
  }
  browser?: {
    data?: {
      device: string
      sessions?: number
    }[]
    lastUpdatedAt?: Date | string
  }
}
interface GAnalyticConfigDto {
  propertyId: string
  clientId: string
  user?: string
}
interface GAnalyticPageView {
  month: number
  monthShort: string
  pageViews: number
}

interface GAnalyticDevice {
  device: string
  sessions: number
}
