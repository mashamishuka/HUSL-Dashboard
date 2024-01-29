import 'next-auth'

declare module 'next-auth' {
  interface User {
    jwt?: string
    user: {
      signature?: string
      address?: string
      id?: string
      addLater?: boolean
      _id?: string
      websiteKey?: string
      email?: string
      name?: string
      company?: string
      profilePicture?: string
      nftId?: string
      productUrl?: string
      wallet?: string
      deleted?: boolean
      role: 'admin' | 'user'
    }
  }

  interface Session {
    signature?: string
    address?: string
    jwt?: string
    user?: User['user']
    id?: string
  }
}
