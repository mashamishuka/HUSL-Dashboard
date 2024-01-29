interface CreateNicheDto {
  name: string
  tagCopy?: {
    key: string
    value: string
  }[]
  products?: string[]
  productMockups?: any
}

interface CreateLeadDto {
  name?: string
  email?: string
  phone?: string
  business?: string
  niche?: string
  status?: 'new' | 'contacted' | 'warm' | 'not-interested' | 'mia' | 'sold'
}

interface AddLeadsNotesDto {
  content: string
}
interface CreateNicheScriptDto {
  title: string
  content: string
  niche: string
}

interface Niche {
  name: string
  tagCopy?: {
    key: string
    value: string
  }[]
  products?: string[]
  suggestedHastags?: string[]
  productMockups?: {
    productId: string
    mockups: FileManager.FileResponse[]
    mobileMockups: FileManager.FileResponse[]
    desktopMockups: FileManager.FileResponse[]
  }[]
  customFields?: Record<string, any>
  createdBy: string
  _id: string
  __v: number
}

interface Leads {
  _id: string
  email: string
  niche: string & Niche
  __v: number
  name: string
  phone: string
  business: string & Business
}

interface NicheScript {
  _id: string
  title: string
  content: string
  niche: string & Niche
  __v: number
}
