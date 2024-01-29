import { Fragment } from 'react'

import { Dialog, Transition } from '@headlessui/react'
import { MdClose } from 'react-icons/md'
import Button from '@components/Button'
import { Formik } from 'formik'
import { toast } from 'react-toastify'
import { Input } from '@components/Forms/components/Input'
import { IoMdTime } from 'react-icons/io'
import { addLeadsNotes } from '@src/restapi/niche/mutation'
interface DefaultModal {
  show: boolean
  // onShow?: boolean
  onClose?: () => void
  width?: string
  data?: any
  mutate?: any
}

export const AddLeadsNoteModal: React.FC<DefaultModal> = ({ show, onClose, width = '32rem', data, mutate }) => {
  const handleAddLeadsNote = async (values: Record<string, any>) => {
    try {
      await addLeadsNotes(data?._id, {
        content: values?.notes
      })
      toast.success('Note added successfully.')
      setTimeout(() => {
        mutate?.()
      }, 500)
    } catch (error: any) {
      toast.error(error?.message || 'Something went wrong, please try again later.')
    }
    onClose?.()
    return
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
                <div>
                  <h3 className="text-lg font-semibold text-white">Notes</h3>
                  {data?.notes?.length > 0 && (
                    <ul className="mt-3 overflow-y-auto divide-y divide-gray-600 max-h-60">
                      {data?.notes?.map((v: any) => (
                        <li className="flex items-center justify-between py-1 space-x-5 text-sm">
                          <span className="flex-1">{v?.content}</span>
                          <div className="flex items-center space-x-1">
                            <span>
                              <IoMdTime />
                            </span>
                            <span className="text-xs">April 3, 2023 10:45 PM</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <Formik
                  initialValues={{
                    notes: ''
                  }}
                  onSubmit={handleAddLeadsNote}
                  enableReinitialize>
                  {({ handleSubmit, handleBlur, handleChange, values, isSubmitting }) => (
                    <form onSubmit={handleSubmit} className="flex flex-col mt-5 space-y-5">
                      <Input
                        label="Add Notes"
                        placeholder="Enter your notes"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        name="notes"
                        value={values?.notes}
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
    </>
  )
}
