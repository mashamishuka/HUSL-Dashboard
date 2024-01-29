export interface EmailConfig {
  _id: string
  token: string
  wallet: string
  __v: number
}
export interface EmailConfigDto {
  token: string
  user?: string // admin only
}
export interface EmailCampaign {
  uid: string
  name?: string
  type?: string
  subject?: string
  plain?: string
  from_email: string
  from_name?: string
  reply_to?: string
  status?: 'error' | 'success'
  delivery_at?: Date | string
  created_at: Date | string
  updated_at?: Date | string
}
