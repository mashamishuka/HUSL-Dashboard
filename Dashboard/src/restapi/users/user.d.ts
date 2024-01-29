import { Account } from '../accounts/account'
import { Business } from '../businesses/business'

export interface User {
  _id: string & {
    $oid: string
  }
  websiteKey?: string
  name: string
  nftId: string
  foundersCard?: string
  email?: string
  company?: string
  productUrl?: string
  wallet?: {
    $oid?: string
  }
  discordUsername?: string
  clients?: number
  accounts?: Account[]
  addLater?: boolean
  role?: 'admin' | 'user'
  profilePicture?: FileManager.FileResponse
  business?: Business[]
  __v: number
}

export interface UserDto {
  websiteKey?: string
  name?: string
  nftId?: string
  email?: string
  company?: string
  currentPassword?: string
  newPassword?: string
  profilePicture?: string
  discordUsername?: string
}
