import { Fragment, useMemo } from 'react'

import { Dialog, Transition } from '@headlessui/react'
import { MdClose } from 'react-icons/md'
import Button from '@components/Button'
import { Formik } from 'formik'
import { Input } from '@components/Forms/components/Input'
import { toast } from 'react-toastify'
import { Dropzone } from '@components/Forms/components'
import { uploadFile } from '@src/restapi/fileManagers/mutation'
import { createOrUpdateTemplate } from '@src/restapi/graphicTemplates/mutations'
import { useRouter } from 'next/router'
import { WarningAlert } from '@components/Alerts'
import { slugify } from '@utils/index'

interface DefaultModal {
  show: boolean
  // onShow?: boolean
  onClose?: () => void
  width?: string
  data?: any
}

export const TemplateMetaModal: React.FC<DefaultModal> = ({ show, onClose, width = '32rem', data }) => {
  const { query, push } = useRouter()
  const templateId = query?.templateId as string

  const handleGraphicMeta: any = async (values: Record<string, any>) => {
    try {
      let sceneString: any
      if (!data?._id) {
        let scene = await data?.sceneString
        scene = new File([scene], slugify(values.name) + '.scene')
        sceneString = await uploadFile(scene, 1, 'scene', slugify(values.name) + '.scene')
        if (!sceneString?._id) {
          toast.error('Error uploading scene')
          return
        }
      } else {
        sceneString = data?.scene
      }
      if (!values.previewUrl) {
        toast.error('Please upload preview image')
        return
      }
      const body: any = {
        name: values.name,
        preview: values.previewUrl,
        scene: sceneString?._id
      }
      if (templateId) {
        body._id = templateId
      }
      if (data?._id) {
        body._id = data?._id
      }
      const template = await createOrUpdateTemplate(body)

      if (!templateId && !data?._id) {
        push(`/admin/generator/graphics/editor?templateId=${template?.data?._id}`)
        toast.success('Template created successfully.')
        onClose?.()
        return
      }
      if (data?._id) {
        toast.success('Template updated successfully.')
        onClose?.()
      }
      // onClose?.()
    } catch (e: any) {
      toast.error(e?.message)
    }
  }
  const initialValues = useMemo(
    () => ({
      name: data?.name || '',
      previewUrl: data?.preview?._id || ''
    }),
    [data]
  )
  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={() => onClose && onClose()}>
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0">
            <Dialog.Overlay className="fixed inset-0 bg-opacity-50 bg-dark backdrop-blur-lg" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="inline-block h-screen align-top" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95">
            <div
              className="relative inline-block w-full overflow-hidden text-left align-middle transition-all border rounded-lg shadow-lg bg-[#2B2A2A] border-dark p-5 max-w-full mt-10"
              style={{
                width
              }}>
              <Formik initialValues={initialValues} onSubmit={handleGraphicMeta}>
                {({ handleSubmit, handleBlur, handleChange, values, errors, isSubmitting, setFieldValue }) => (
                  <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
                    <span>Manage Template</span>
                    {!data?._id && (
                      <WarningAlert>
                        This is one time only, you might need to edit the template info (name, preview image) on the template
                        list.
                        <br />
                        You will not see this popup once you saved it.
                      </WarningAlert>
                    )}
                    <Input
                      label="Template Name"
                      placeholder="Enter template name"
                      type="text"
                      name="name"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values?.name}
                      error={errors?.name?.toString()}
                      required
                    />
                    <Dropzone
                      label="Template Preview"
                      name="previewUrl"
                      value={values?.previewUrl}
                      current={data?.preview?.url}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      setFieldValue={setFieldValue}
                      accept={{
                        'image/*': ['.jpeg', '.png']
                      }}
                      required
                    />
                    <div>
                      <Button type="submit" variant="outline" text="Save" size="sm" loading={isSubmitting} />
                    </div>
                  </form>
                )}
              </Formik>
              <button type="button" className="absolute right-5 top-3" onClick={() => onClose && onClose()}>
                <MdClose width={24} />
              </button>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}
