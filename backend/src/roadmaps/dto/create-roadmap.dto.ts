export class CreateRoadmapDto {
  roadmaps: {
    title: string;
    items: string[];
  }[];
  user?: string;
}
