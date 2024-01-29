import * as yup from 'yup'

export const fbAdsCampaignSchema = yup.object({
  name: yup.string().required('Please enter the campaign name.'),
  campaignObjective: yup.string().required('Please select the campaign objective.'),
  specialAdCategories: yup.string().required('Please select the special ad categories.')
})
