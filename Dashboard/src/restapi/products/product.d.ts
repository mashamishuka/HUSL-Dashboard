interface CreateProductDto {
  name: string
  websiteKey: string
}
type UpdateProductDto = CreateProductDto

interface Product {
  name: string
  websiteKey: string
  usedByNiches?: string[]
  createdBy: string
  shortAdCopy?: string
  longAdCopy?: string
  _id: string
  __v: number
}
