import { Fragment } from 'react'

import { Dialog, Transition } from '@headlessui/react'
import { MdClose } from 'react-icons/md'
import Button from '@components/Button'
import { Formik } from 'formik'
import { toast } from 'react-toastify'
import { Input } from '@components/Forms/components/Input'
import { TextEditor } from '@components/Forms/components'
import { useRouter } from 'next/router'
import { mutate } from 'swr'
import { createSetting, updateSetting } from '@src/restapi/setting/mutation'
import { useSetting } from '@hooks/useSetting'

interface DefaultModal {
  show: boolean
  // onShow?: boolean
  onClose?: () => void
  width?: string
}

export const AddNicheScript: React.FC<DefaultModal> = ({ show, onClose, width = '42rem' }) => {
  const { query } = useRouter()
  const { value: scripts } = useSetting('niche-script')
  const handleAddNicheScript = async (values: Record<string, any>) => {
    const nicheId = query?.id?.toString()
    if (!nicheId) return
    try {
      const body = {
        title: values?.title,
        content: values?.content,
        niche: nicheId
      }
      // if there is already a script, add it to the array
      if (scripts?.length > 0) {
        const newScripts = [...scripts, body]
        await updateSetting('niche-script', {
          value: newScripts
        })
      } else {
        await createSetting({
          key: 'niche-script',
          value: [body]
        })
      }

      mutate?.('/settings')
      toast.success('Script added successfully.')
    } catch (error: any) {
      toast.error(error?.message || 'Something went wrong, please try again later.')
    }
    onClose?.()
    return values
  }
  return (
    <>
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
              <Dialog.Overlay className="fixed inset-0 bg-dark bg-opacity-10 backdrop-blur-sm" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span className="inline-block h-screen align-middle" aria-hidden="true">
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
                className="relative inline-block w-full overflow-hidden text-left align-middle transition-all border rounded-lg shadow-lg bg-[#2B2A2A] border-dark p-5 max-w-full"
                style={{
                  width
                }}>
                <Formik
                  initialValues={{
                    title: '',
                    content: ''
                  }}
                  onSubmit={handleAddNicheScript}
                  enableReinitialize>
                  {({ handleSubmit, handleBlur, handleChange, values, isSubmitting, setFieldValue }) => (
                    <form onSubmit={handleSubmit} className="flex flex-col mt-5 space-y-5">
                      <Input
                        label="Title"
                        placeholder="Enter script title"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        name="title"
                        value={values?.title}
                        required
                      />
                      <TextEditor label="Script (Bracket supported)" name="content" setFieldValue={setFieldValue} required />
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
    </>
  )
}
