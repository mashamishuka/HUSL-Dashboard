import * as yup from 'yup'

export const fbAdsConfigSchema = yup.object({
  adAccountId: yup
    .string()
    .required('Please enter the FB Ad Account ID.')
    .test('start-with-act', 'FB Ad Account ID should be starts with act_', (value) => {
      if (value?.startsWith('act_')) return true
      return false
    }),
  token: yup.string().required('Please enter the FB Ad Marketing Token.')
})
