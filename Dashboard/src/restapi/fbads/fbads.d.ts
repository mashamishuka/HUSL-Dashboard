export interface FbAdsConfig {
  _id: string
  adAccountId: string
  wallet: string
  __v: number
  hasToken: boolean
}
export interface FbAdsConfigDto {
  adAccountId: string
  token: string
  user?: string // admin only
}

export interface FbAdsCampaign extends Record<string, string> {
  name: string
  status: 'ACTIVE' | 'PAUSED'
  lifetime_budget?: string
  daily_budget?: string
  budget_remaining?: string
  buying_type: string
  id: string
}

export interface FbAdsAdsets extends Record<string, any> {
  name: string
  status: 'ACTIVE' | 'PAUSED'
  bid_amount?: number
  budget_remaining?: string
  targeting?: Record<string, any>
  campaign: {
    id: string
  }
  is_dynamic_creative?: boolean
  optimization_goal?: string
  promoted_object?: {
    pixel_id?: string
    custom_event_type?: string
  }
  id: string
}

export interface FbAdsAd extends Record<string, any> {
  name: string
  adset?: FbAdsAdsets
  campaign?: FbAdsCampaign
  bid_amount?: number
  creative?: {
    name: string
    id: string
  }
  created_time?: Date | string
  status: 'ACTIVE' | 'PAUSED'
  id: string
}

export interface FbAdsCPC {
  periodType: 'weekly' | 'monthly' | 'yearly'
  datePreset?: string
  timeRange?: {
    start?: string
    end?: string
  }
  cpc: {
    day?: string
    date?: string
    dayShort?: string
    month?: string
    monthShort?: string
    cpc: number
  }[]
}
