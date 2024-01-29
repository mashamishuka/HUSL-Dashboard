declare namespace Course {
  interface Topic {
    _id: string
    title: string
    content: string
    video?: string
    reward: number
    attachment?: string
    completion_time: number
    linked_videos?: string[]
  }
  interface Chapter {
    _id: string
    title: string
    topics: Topic[]
  }
  interface Course {
    _id: string
    title: string
    chapters: Chapter[]
    published: boolean
    createdBy: string
    createdAt: Date
    deleted?: boolean
  }
}
