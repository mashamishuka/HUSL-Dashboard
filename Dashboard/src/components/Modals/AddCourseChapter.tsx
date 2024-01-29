import { Formik } from 'formik'
import { Fragment } from 'react'
import { toast } from 'react-toastify'

import Button from '@components/Button'
import { Input } from '@components/Forms/components/Input'
import { Dialog, Transition } from '@headlessui/react'
import { createChapter } from '@src/restapi/course/mutations'

interface DefaultModal {
  show: boolean
  courseId?: string
  // onShow?: boolean
  onClose?: () => void
  width?: string
  mutate?: () => void
}
export const AddCourseChapter: React.FC<DefaultModal> = ({ show, onClose, width = '42rem', courseId, mutate }) => {
  const handleAddChapter = async (values: Record<string, any>) => {
    if (!courseId) return
    try {
      await createChapter(courseId, values)
      toast.success('Chapter successfully created.')
      mutate?.()
      onClose?.()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Something went wrong, please try again later.')
    }
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
              <Dialog.Overlay className="fixed inset-0 bg-dark bg-opacity-30 backdrop-blur-md" />
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
                <span className="block mb-5 text-xl font-semibold">Add Course Chapter</span>
                <Formik
                  initialValues={{
                    title: ''
                  }}
                  onSubmit={handleAddChapter}
                  enableReinitialize>
                  {({ handleSubmit, handleBlur, handleChange, values, isSubmitting }) => (
                    <form onSubmit={handleSubmit} className="flex flex-col mt-5 space-y-5">
                      <Input
                        label="Title"
                        placeholder="Enter your chapter title"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        name="title"
                        value={values?.title}
                        required
                      />
                      <div>
                        <Button type="submit" variant="outline" text="Save" size="sm" loading={isSubmitting} />
                      </div>
                    </form>
                  )}
                </Formik>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
