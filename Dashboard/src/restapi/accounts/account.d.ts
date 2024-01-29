export interface Account {
  _id: string & {
    $oid: string
  }
  websiteKey: string
  username: string
  password?: string
  user?: {
    $oid?: string
  }
  verified: boolean
  __v: number
}
export interface AccountDto {
  websiteKey: string
  username: string
  password?: string
  verified?: boolean
}
export interface SocialAccount {
  _id: string & {
    $oid: string
  }
  websiteList?: string
  username: string
  password?: string
  user?: {
    $oid?: string
  }
  social?: 'fb' | 'ig' | 'twitter' | 'tiktok'
  verified: boolean
  __v: number
}

export interface SocialAccountDto {
  websiteList?: string
  username?: string
  password?: string
  social?: 'fb' | 'ig' | 'twitter' | 'tiktok'
}
