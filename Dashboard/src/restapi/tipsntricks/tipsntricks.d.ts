interface TipsNTrickItem {
  title: string
  description?: string
}

export type TipsNTrickDto = TipsNTrickItem[]

export interface TipsNTrick {
  _id: string
  user: string
  tipsNtricks: TipsNTrickItem[]
}
