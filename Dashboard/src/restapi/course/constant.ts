export const GET_COURSES = '/courses'
export const ADD_COURSES = '/courses'
export const EDIT_COURSE = (id: string) => `/courses/${id}`
export const ADD_COURSE_CHAPTER = (id: string) => `/courses/${id}/chapters`
export const EDIT_COURSE_CHAPTER = (id: string, chapterId: string) => `/courses/${id}/chapters/${chapterId}`
export const ADD_COURSE_TOPIC = (id: string, chapterId: string) => `/courses/${id}/chapters/${chapterId}/topics`
export const EDIT_COURSE_TOPIC = (id: string, chapterId: string, topicId: string) =>
  `/courses/${id}/chapters/${chapterId}/topics/${topicId}`
