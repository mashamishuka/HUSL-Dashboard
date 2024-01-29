import Button from '@components/Button'
import { createCampaign } from '@src/restapi/fbads/mutation'
import { Formik } from 'formik'
import { useRouter } from 'next/router'
import { MdChevronLeft, MdSave } from 'react-icons/md'
import { toast } from 'react-toastify'
import { Input } from '../components/Input'
import { fbAdsCampaignSchema } from './schema'
import { Wrapper } from '@components/Layouts/Wrapper'
import { SingleSelect } from '../components'

const campaignCreationInitial = {
  name: '',
  campaignObjective: 'BRAND_AWARENESS',
  specialAdCategories: 'NONE'
}

export const FBCampaignAdd: React.FC = () => {
  const router = useRouter()

  const handleCampaignAdd = async (values: Record<string, any>) => {
    try {
      const body = {
        name: values.name,
        objective: values.campaignObjective,
        special_ad_categories: [values.specialAdCategories],
        status: 'PAUSED'
      }
      await createCampaign(body)
      toast.success('Campaign created.')
      router.push('/marketing/fb-ads')
    } catch (error) {
      toast.error('Error creating campaign.')
    }
  }

  return (
    <div>
      <button onClick={() => router.back()} className="flex items-center mb-3 space-x-2">
        <MdChevronLeft size={16} />
        <span>Back</span>
      </button>
      <Wrapper title="Add FB Ads Campaign">
        <Formik
          initialValues={campaignCreationInitial}
          onSubmit={handleCampaignAdd}
          validationSchema={fbAdsCampaignSchema}
          enableReinitialize>
          {({ values, handleChange, handleBlur, handleSubmit, errors, isSubmitting, setFieldValue }) => (
            <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
              <Input
                label="Campaign Name"
                placeholder="FB Ads campaign name"
                name="name"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values?.name}
                error={errors?.name}
              />
              <SingleSelect
                label="Campaign Objective"
                name="campaignObjective"
                setFieldValue={setFieldValue}
                value={values?.campaignObjective}
                error={errors?.campaignObjective}
                hideSearch
                items={[
                  { label: 'Brand Awareness', value: 'BRAND_AWARENESS' },
                  { label: 'Reach', value: 'REACH' },
                  { label: 'Traffic', value: 'TRAFFIC' },
                  { label: 'Engagement', value: 'ENGAGEMENT' },
                  { label: 'App Installs', value: 'APP_INSTALLS' },
                  { label: 'Video Views', value: 'VIDEO_VIEWS' },
                  { label: 'Lead Generation', value: 'LEAD_GENERATION' },
                  { label: 'Messages', value: 'MESSAGES' },
                  { label: 'Conversions', value: 'CONVERSIONS' },
                  { label: 'Store Traffic', value: 'STORE_TRAFFIC' },
                  { label: 'Event Responses', value: 'EVENT_RESPONSES' },
                  { label: 'Dynamic Ads', value: 'DYNAMIC_ADS' },
                  { label: 'Product Catalog Sales', value: 'PRODUCT_CATALOG_SALES' },
                  { label: 'Local Awareness', value: 'LOCAL_AWARENESS' },
                  { label: 'Link Clicks', value: 'LINK_CLICKS' }
                ]}
              />
              <SingleSelect
                label="Special Ad Category"
                name="specialAdCategories"
                setFieldValue={setFieldValue}
                value={values?.specialAdCategories}
                error={errors?.specialAdCategories}
                hideSearch
                items={[
                  { label: 'None', value: 'NONE' },
                  { label: 'Job Listings', value: 'JOB_LISTINGS' },
                  { label: 'Housing', value: 'HOUSING' },
                  { label: 'Credit', value: 'CREDIT' },
                  { label: 'Issues Elections Politics', value: 'ISSUES_ELECTIONS_POLITICS' },
                  { label: 'Online Gambling and Gaming', value: 'ONLINE_GAMBLING_AND_GAMING' }
                ]}
              />
              <div className="flex items-center space-x-3">
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                  loading={isSubmitting}>
                  <MdSave />
                  <span>Save Setting</span>
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </Wrapper>
    </div>
  )
}
