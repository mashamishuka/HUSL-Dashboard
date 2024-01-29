import api from '@services/api'
import { CREATE_USER_ROADMAP } from './constants'
import { Roadmap, RoadmapDto } from './roadmap'

export const createUserRoadmap = async (body: RoadmapDto, userId?: string): Promise<RestApi.Response<Roadmap>> => {
  const data: Record<string, any> = {
    roadmaps: body
  }
  if (userId) {
    data.user = userId
  }
  return await api
    .post(CREATE_USER_ROADMAP, data)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}
