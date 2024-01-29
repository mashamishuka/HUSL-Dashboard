import api from '@services/api'
import { CREATE_NICHE, UPDATE_NICHE, IMPORT_LEADS, UPDATE_LEADS, ADD_LEADS_NOTES, CREATE_NICHE_SCRIPTS } from './constants'

export const createNiche = async (data: CreateNicheDto): Promise<RestApi.Response<Niche>> => {
  return await api
    .post(CREATE_NICHE, data)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}

export const updateNiche = async (id: string, data: CreateNicheDto): Promise<RestApi.Response<RestApi.UpdateTypes>> => {
  return await api
    .patch(UPDATE_NICHE + id, data)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}

export const deleteNiche = async (id: string): Promise<RestApi.Response<RestApi.UpdateTypes>> => {
  return await api
    .delete(UPDATE_NICHE + id)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}

export const importLeads = async (nicheId: string, leads?: CreateLeadDto[]): Promise<RestApi.Response<Leads[]>> => {
  return await api
    .post(IMPORT_LEADS(nicheId), leads)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}

export const updateLeads = async (leadsId: string, data: CreateLeadDto): Promise<RestApi.Response<Leads>> => {
  return await api
    .patch(UPDATE_LEADS(leadsId), data)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}

export const addLeadsNotes = async (leadsId: string, data: AddLeadsNotesDto): Promise<RestApi.Response<Leads>> => {
  return await api
    .post(ADD_LEADS_NOTES(leadsId), data)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}

export const addScripts = async (data: CreateNicheScriptDto): Promise<RestApi.Response<NicheScript>> => {
  return await api
    .post(CREATE_NICHE_SCRIPTS, data)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}

export const deleteScripts = async (id: string): Promise<RestApi.Response<RestApi.UpdateTypes>> => {
  return await api
    .delete(CREATE_NICHE_SCRIPTS + '/' + id)
    .then(({ data }) => data)
    .catch((err) => {
      throw new Error(err)
    })
}
