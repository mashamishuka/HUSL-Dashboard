export const CREATE_NICHE = '/niches'
export const GET_NICHES = '/niches/'
export const UPDATE_NICHE = '/niches/'
export const GET_BUSINESS_IN_NICHE = (id: string) => `/niches/${id}/businesses`
export const IMPORT_LEADS = (nicheId: string) => `/leads/${nicheId}/import`
export const GET_LEADS = '/leads'
export const UPDATE_LEADS = (leadsId: string) => `/leads/${leadsId}`
export const ADD_LEADS_NOTES = (leadsId: string) => `/leads/${leadsId}/notes`
export const GET_NICHE_SCRIPTS = (nicheId: string) => `/niche-scripts/${nicheId}`
export const CREATE_NICHE_SCRIPTS = '/niche-scripts'
