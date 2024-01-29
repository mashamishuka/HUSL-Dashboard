import { Formik } from 'formik'
import { MdInfo, MdSave } from 'react-icons/md'
import { toast } from 'react-toastify'

import Button from '@components/Button'
import { Dropzone, InputAddon, Tags, TextArea } from '@components/Forms/components'
import { Input } from '@components/Forms/components/Input'
import { editNicheSchema } from './schema'
import { useState, useMemo } from 'react'
import { MultipleSelectProduct } from '@components/Forms/components/Selects/dynamic/MultipleProduct'
import { updateNiche } from '@src/restapi/niche/mutation'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { GET_NICHES } from '@src/restapi/niche/constants'
import { useUpdateEffect } from 'react-use'

interface AddProductInitialProps {
  name: string
  tagCopy: {
    [key: string]: string
  } | null
  products: Record<string, any>[]
  productMockups?: any
  suggestedHastags?: string[]
  customFields?: Record<string, any>
}

const availableTags = ['audience', 'pain-point', 'motivation', 'customer', 'sale', 'platform', 'generic graphic']
export const EditNicheForm: React.FC = () => {
  const router = useRouter()
  const nicheId = router?.query?.id?.toString()

  const [selectedProducts, setSelectedProducts] = useState<any>([])
  const { data } = useSWR<RestApi.Response<Niche>>(nicheId ? GET_NICHES + nicheId : null)

  const initialValues: AddProductInitialProps = useMemo(() => {
    return {
      name: data?.data?.name || '',
      tagCopy:
        data?.data?.tagCopy?.reduce((acc: any, curr) => {
          const k = curr?.key?.replace(/[[\]]/g, '')
          acc[k] = curr?.value
          return acc
        }, {}) || '',
      products: [],
      productMockups: data?.data?.productMockups?.reduce((acc: any, curr) => {
        acc[curr?.productId] = {
          mockups: curr?.mockups,
          mobileMockups: curr?.mobileMockups,
          desktopMockups: curr?.desktopMockups
        }
        return acc
      }, {}),
      suggestedHastags: data?.data?.suggestedHastags || [],
      customFields: data?.data?.customFields || {}
    }
  }, [data?.data])

  useUpdateEffect(() => {
    setSelectedProducts(
      data?.data?.products?.map((v: any) => ({
        label: v?.name,
        value: v?._id
      }))
    )
  }, [data?.data])

  const handleAddNiche = async (values: Record<string, any>) => {
    if (!nicheId) return
    try {
      // convert tag copy to array of object with key and value
      const tagCopy = availableTags?.map((tag) => ({
        key: `[${tag}]`,
        value: values?.tagCopy?.[tag] || `[${tag}]`
      }))
      const products = selectedProducts?.map((v: any) => v?.value)
      // convert to array of object from object
      let productMockups = Object?.entries(values?.productMockups)?.map(([key, value]: any) => ({
        productId: key,
        mockups: value.mockups as any[],
        mobileMockups: value.mobileMockups as any[],
        desktopMockups: value.desktopMockups as any[]
      }))
      // filter product mockups
      productMockups = productMockups?.map((p) => {
        if (typeof p.mockups !== 'string') {
          p.mockups = [p.mockups?.[0]?._id]
        } else {
          p.mockups = [p.mockups]
        }
        if (typeof p.mobileMockups !== 'string') {
          p.mobileMockups = [p.mobileMockups?.[0]?._id]
        } else {
          p.mobileMockups = [p.mobileMockups]
        }
        if (typeof p.desktopMockups !== 'string') {
          p.desktopMockups = [p.desktopMockups?.[0]?._id]
        } else {
          p.desktopMockups = [p.desktopMockups]
        }
        return p
      })

      // check if each product mockup has at least mockups
      const hasMockup = productMockups?.every((v) => v?.mockups?.length >= 1)
      if (!hasMockup) {
        toast.error('Please upload at least one mockup for each product')
        return
      }
      // check if has mobile mockup
      const hasMobileMockup = productMockups?.every((v) => v?.mobileMockups?.length > 0)
      if (!hasMobileMockup) {
        toast.error('Please upload mobile mockup for each product')
        return
      }
      // check if has desktop mockup
      const hasDesktopMockup = productMockups?.every((v) => v?.desktopMockups?.length > 0)
      if (!hasDesktopMockup) {
        toast.error('Please upload desktop mockup for each product')
        return
      }

      const data = {
        name: values?.name,
        products,
        tagCopy,
        productMockups,
        suggestedHastags: values?.suggestedHastags,
        customFields: values?.customFields
      }
      await updateNiche(nicheId, data).then((res) => {
        if (res?.data) {
          toast.success('Niche updated successfully. Redirecting...')
          router?.push('/admin/builder/niche')
        }
      })
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Something went wrong. Please try again later.')
    }
  }

  return (
    <Formik initialValues={initialValues} onSubmit={handleAddNiche} validationSchema={editNicheSchema} enableReinitialize>
      {({ values, handleChange, handleBlur, handleSubmit, errors, isSubmitting, setFieldValue }) => (
        <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
          <Input
            label="Enter Niche"
            placeholder="Technology"
            name="name"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values?.name}
            error={errors?.name}
            required
          />

          <div>
            <MultipleSelectProduct label="Choose Product" name="product" onChange={setSelectedProducts} />
            {selectedProducts?.length > 0 && (
              <div className="flex flex-col pl-8 mt-3 space-y-3 border-l border-gray-500">
                {selectedProducts?.map((data?: any, i?: number) => (
                  <div key={i} className="grid grid-cols-3 gap-x-3">
                    <Dropzone
                      label={`Upload ${data?.label} mobile mockup`}
                      name={`productMockups.${data?.value}.mobileMockups`}
                      accept={{
                        'image/*': ['.jpeg', '.png']
                      }}
                      // value={values?.productMockups?.[data?.value]?.mobileMockups?.[0]?._id}
                      setFieldValue={setFieldValue}
                      current={values?.productMockups?.[data?.value]?.mobileMockups?.[0]}
                      compact
                    />
                    <Dropzone
                      label={`Upload ${data?.label} desktop mockup`}
                      name={`productMockups.${data?.value}.desktopMockups`}
                      accept={{
                        'image/*': ['.jpeg', '.png']
                      }}
                      // value={values?.productMockups?.[data?.value]?.desktopMockups?.[0]?._id}
                      setFieldValue={setFieldValue}
                      current={values?.productMockups?.[data?.value]?.desktopMockups?.[0]}
                      compact
                    />
                    <Dropzone
                      label={`Upload ${data?.label} mockup`}
                      name={`productMockups.${data?.value}.mockups`}
                      accept={{
                        'image/*': ['.jpeg', '.png']
                      }}
                      // value={values?.productMockups?.[data?.value]?.mockups?.[0]?._id}
                      setFieldValue={setFieldValue}
                      current={values?.productMockups?.[data?.value]?.mockups?.[0]}
                      compact
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          <Tags
            label="Suggested Hastags"
            name="suggestedHastags"
            values={values?.suggestedHastags}
            setFieldValue={setFieldValue}
          />

          <div>
            <label className="text-sm">Tag Copy</label>
            {availableTags?.map((tag: string, i: number) => (
              <InputAddon
                key={i}
                addonText={`[${tag}]`}
                placeholder={tag}
                name={`tagCopy.${tag}`}
                data-tag-key={tag}
                onChange={handleChange}
                onBlur={handleBlur}
                value={values?.tagCopy?.[tag]}
                type={tag === 'generic graphic' ? 'textarea' : 'text'}
              />
            ))}

            <div className="flex items-center mt-2 space-x-2">
              <span className="pt-0.5">
                <MdInfo className="text-blue-400" />
              </span>
              <span className="text-sm text-gray-300">
                Tag copy will change copy in website. For example, if you have [audience] in website, it will change to the
                value you have been input here.
              </span>
            </div>
          </div>

          <TextArea
            label="My Customers"
            placeholder="Enter your customers"
            name="customFields.myCustomersText"
            hint="Shown in Brand Overview. Above Brackets supported."
            onChange={handleChange}
            onBlur={handleBlur}
            value={values?.customFields?.myCustomersText}
            required
          />

          <div>
            <div>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="flex items-center mt-5 space-x-2"
                loading={isSubmitting}>
                <MdSave />
                <span>Save Setting</span>
              </Button>
            </div>
          </div>
        </form>
      )}
    </Formik>
  )
}
