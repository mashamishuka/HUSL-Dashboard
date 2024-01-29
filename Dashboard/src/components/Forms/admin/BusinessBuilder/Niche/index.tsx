import { Formik } from 'formik'
import { MdInfo, MdSave } from 'react-icons/md'
import { toast } from 'react-toastify'

import Button from '@components/Button'
import { Dropzone, InputAddon, Tags } from '@components/Forms/components'
import { Input } from '@components/Forms/components/Input'
import { createNicheSchema } from './schema'
import { useState } from 'react'
import { MultipleSelectProduct } from '@components/Forms/components/Selects/dynamic/MultipleProduct'
import { createNiche } from '@src/restapi/niche/mutation'
import { useRouter } from 'next/router'

const addProductInitial = {
  name: '',
  tagCopy: null,
  products: [],
  productMockups: []
} as {
  name: string
  tagCopy: {
    [key: string]: string
  } | null
  products: Record<string, any>[]
  productMockups?: any
}

const availableTags = ['audience', 'pain-point', 'motivation', 'customer', 'sale', 'platform', 'generic graphic']
export const CreateNicheForm: React.FC = () => {
  const router = useRouter()
  const [selectedProducts, setSelectedProducts] = useState<any>([])

  const handleAddNiche = async (values: Record<string, any>) => {
    try {
      // convert tag copy to array of object with key and value
      const tagCopy = availableTags?.map((tag) => ({
        key: `[${tag}]`,
        value: values?.tagCopy?.[tag] || `[${tag}]`
      }))
      const products = selectedProducts?.map((v: any) => v?.value)
      // convert to array of object from object
      const productMockups = Object?.entries(values?.productMockups)?.map(([key, value]) => ({
        productId: key,
        mockups: value
      }))

      const data = {
        name: values?.name,
        products,
        tagCopy,
        productMockups,
        suggestedHastags: values?.suggestedHastags
      }

      await createNiche(data).then((res) => {
        if (res?.data?._id) {
          toast.success('Niche created successfully.')
          router?.push('/admin/builder/niche')
        }
      })
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Something went wrong. Please try again later.')
    }
  }

  return (
    <Formik
      initialValues={addProductInitial}
      onSubmit={handleAddNiche}
      validationSchema={createNicheSchema}
      enableReinitialize>
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
                  <Dropzone
                    key={i}
                    label={`Upload ${data?.label} mockup`}
                    name={`productMockups.${data?.value}`}
                    accept={{
                      'image/*': ['.jpeg', '.png']
                    }}
                    value={values?.productMockups?.[data?.value]}
                    setFieldValue={setFieldValue}
                    multiple
                    compact
                  />
                ))}
              </div>
            )}
          </div>

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

          <Tags label="Suggested Hastags" name="suggestedHastags" setFieldValue={setFieldValue} />
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
