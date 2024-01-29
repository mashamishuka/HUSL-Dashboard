declare namespace RestApi {
  interface Response<T> {
    data: T
    meta?: {
      page: number
      pageCount: number
      limit: number
      total: number
    }
    message: string
    status: number
  }
  interface WebHuslPaginate<T> {
    data: T
    current_page: number
    first_page_url: number
    from: number
    last_page: number
    last_page_url: number
    links: {
      url: string
      label: string
      active: boolean
    }[]
    next_page_url?: number
    path: string
    per_page: number
    prev_page_url?: number
    to: number
    total: number
  }

  interface UpdateTypes {
    acknowledge: boolean
    matchedCount: number
    modifiedCount: number
    upsertedId: any
    upsertedCount: number
  }
}
