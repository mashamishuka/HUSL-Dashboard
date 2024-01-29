import api from '@services/api'
import {
  CREATE_CONFIG,
  CREATE_FBADS_CAMPAIGN,
  UPDATE_FBADS_ADS,
  UPDATE_FBADS_ADSETS,
  UPDATE_FBADS_CAMPAIGN
} from './constants'
import { FbAdsAdsets, FbAdsCampaign, FbAdsConfig, FbAdsConfigDto } from './fbads'

export const createFbAdsConfig = async (body: FbAdsConfigDto): Promise<RestApi.Response<FbAdsConfig>> => {
  return await api
    .post(CREATE_CONFIG, body)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}

export const updateCampaign = async (
  campaignId: string,
  body?: Record<string, any>
): Promise<RestApi.Response<FbAdsCampaign>> => {
  return await api
    .patch(UPDATE_FBADS_CAMPAIGN + campaignId, body)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}

export const updateAdSet = async (adsetId: string, body: Record<string, any>): Promise<RestApi.Response<FbAdsAdsets>> => {
  return await api
    .patch(UPDATE_FBADS_ADSETS + adsetId, body)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}

export const updateAds = async (adsId: string, body: Record<string, any>): Promise<RestApi.Response<FbAdsAdsets>> => {
  return await api
    .patch(UPDATE_FBADS_ADS + adsId, body)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}

export const createCampaign = async (body: Record<string, any>): Promise<RestApi.Response<FbAdsCampaign>> => {
  return await api
    .post(CREATE_FBADS_CAMPAIGN, body)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}
