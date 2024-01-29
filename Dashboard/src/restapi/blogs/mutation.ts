import api from '@services/api'
import {
  ADD_BLOG_POST,
  DELETE_BLOG_CATEGORY,
  DELETE_BLOG_POST,
  EDIT_BLOG_CATEGORY,
  EDIT_BLOG_POST,
  WEBSITE_BLOG_CATEGORIES
} from './constants'

export const addBlogPost = async (body: Record<string, any>): Promise<Blog> => {
  return await api
    .post(ADD_BLOG_POST, body)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err?.response?.data?.message)
    })
}

export const editBlogPost = async (id: string, body: Record<string, any>): Promise<Blog> => {
  return await api
    .post(EDIT_BLOG_POST(id), body)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err?.response?.data?.message)
    })
}

export const deleteBlogPost = async (id: string, websiteKey?: string): Promise<boolean> => {
  return await api
    .delete(DELETE_BLOG_POST(id), {
      params: {
        landingpage_id: websiteKey
      }
    })
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err?.response?.data?.message)
    })
}

export const addBlogCategory = async (body: Record<string, any>): Promise<BlogCategory> => {
  return await api
    .post(WEBSITE_BLOG_CATEGORIES, body)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err?.response?.data?.message)
    })
}

export const editBlogCategory = async (id: string, body: Record<string, any>): Promise<BlogCategory> => {
  return await api
    .post(EDIT_BLOG_CATEGORY(id), body)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err?.response?.data?.message)
    })
}

export const deleteBlogCategory = async (id: string): Promise<boolean> => {
  return await api
    .delete(DELETE_BLOG_CATEGORY(id))
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err?.response?.data?.message)
    })
}
