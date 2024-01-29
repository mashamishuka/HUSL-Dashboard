interface RoadmapItem {
  title: string
  items?: string[]
}

export type RoadmapDto = RoadmapItem[]

export interface Roadmap {
  _id: string
  user: string
  roadmaps: RoadmapItem[]
}
