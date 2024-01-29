export interface Purchase {
  _id: string & {
    $oid: string
  }
  customers?: number
  data?: Record<string, any>
  user: string
  name: string
  amount: amount
  note?: string
  pay_via_stripe: pay_via_stripe
  __v: number
}

export interface PurchaseDto {
  name: string
  amount: amount
  pay_via_stripe: pay_via_stripe
}
