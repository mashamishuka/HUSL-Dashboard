import * as yup from 'yup'

export const GAConfigSchema = yup.object({
  propertyId: yup.string().required('Please enter the Google Analytics Property ID.'),
  // .test('start-with-prop', 'Should be starts with properties/', (value) => {
  //   if (value?.startsWith('properties/')) return true
  //   return false
  // }),
  clientId: yup.string().required('Please enter the Google Client ID.')
  // apiKey: yup.string().required('Please enter the Google API Key.')
})
