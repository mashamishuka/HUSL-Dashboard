export interface Customer {
  _id: string
  fullname: string
  gender?: 'male' | 'female'
  email: string
  phone: string
  __v: number
  trashed?: boolean
  profilePicture?: RestApi.Media
}

export interface CustomerDto {
  fullname: string
  gender?: 'male' | 'female' | string
  email: string
  phone: string
  trashed?: boolean
  profilePicture?: string
}
