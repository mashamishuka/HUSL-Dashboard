import clsx from 'clsx'
import { Formik } from 'formik'
import { Fragment, useState } from 'react'
import { toast } from 'react-toastify'

import Button from '@components/Button'
import { Dropzone, TextEditor } from '@components/Forms/components'
import { Input } from '@components/Forms/components/Input'
import { Dialog, Transition } from '@headlessui/react'
import { editTopic } from '@src/restapi/course/mutations'

interface DefaultModal {
  show: boolean
  // onShow?: boolean
  onClose?: () => void
  width?: string
  courseId?: string
  chapterId?: string | null
  data?: Course.Topic | null
  mutate?: () => void
}
export const EditCourseTopic: React.FC<DefaultModal> = ({
  show,
  onClose,
  width = '42rem',
  data,
  courseId,
  chapterId,
  mutate
}) => {
  const [uploadType, setUploadType] = useState<'youtube' | 'manual'>('manual')

  const handleEditTopic = async (values: Record<string, any>) => {
    if (!data?._id || !courseId || !chapterId) return
    try {
      // map for linked videos
      if (values?.linked_videos) {
        values.linked_videos = values.linked_videos.split(',').map((item: string) => item.trim())
      }
      await editTopic(courseId, chapterId, data?._id, values)
      toast.success('Topic successfully edited.')
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
                <span className="block mb-5 text-xl font-semibold">Edit Course Chapter</span>
                <Formik
                  initialValues={{
                    title: data?.title || '',
                    reward: data?.reward || 0,
                    video: data?.video || '',
                    attachment: data?.attachment || '',
                    content: data?.content || '',
                    completion_time: data?.completion_time || '',
                    linked_videos: data?.linked_videos?.join(', ') || ''
                  }}
                  onSubmit={handleEditTopic}
                  enableReinitialize>
                  {({ handleSubmit, handleBlur, handleChange, values, isSubmitting, setFieldValue }) => (
                    <form onSubmit={handleSubmit} className="flex flex-col mt-5 space-y-5">
                      <Input
                        label="Title"
                        placeholder="Enter your topic title"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        name="title"
                        value={values?.title}
                        required
                      />
                      <Input
                        type="number"
                        label="Reward"
                        placeholder="Enter reward"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        name="reward"
                        value={values?.reward}
                        hint="Reward will be given to the user after completing this topic"
                        required
                      />
                      <Input
                        label="Completion Time"
                        placeholder="Enter estimated completion time"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        name="completion_time"
                        value={values?.completion_time}
                        required
                      />
                      <div className="flex flex-col space-y-1">
                        <label className="text-sm font-light">Choose video upload method *</label>
                        <div className="flex items-center space-x-3 border-b border-white border-opacity-10">
                          <button
                            type="button"
                            onClick={() => setUploadType('manual')}
                            className={clsx('text-sm', uploadType === 'manual' && 'border-b border-primary font-semibold')}>
                            Manual
                          </button>
                          <button
                            type="button"
                            onClick={() => setUploadType('youtube')}
                            className={clsx('text-sm', uploadType === 'youtube' && 'border-b border-primary font-semibold')}>
                            Youtube
                          </button>
                        </div>
                      </div>
                      {uploadType === 'manual' && (
                        <Dropzone
                          label="Upload Video *"
                          name="video"
                          accept={{
                            'video/*': ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.3gp', '.webm']
                          }}
                          value={values?.video}
                          setFieldValue={setFieldValue}
                          current={values?.video}
                          returnObject="url"
                          compact
                          required
                        />
                      )}
                      {uploadType === 'youtube' && (
                        <Input
                          label="Youtube Video Link"
                          placeholder="Enter link of the youtube video."
                          onChange={handleChange}
                          onBlur={handleBlur}
                          name="video"
                          value={values?.video}
                          containerClass="w-full"
                          required
                        />
                      )}
                      <Input
                        label="Linked Videos"
                        placeholder="Enter linked video urls"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        name="linked_videos"
                        value={values?.linked_videos}
                        hint="Separate multiple links with comma (,)"
                      />
                      <Dropzone
                        label="Attachment *"
                        name="attachment"
                        accept={{
                          '*': ['.pdf', '.doc', '.docx', '.xls', '.xlsx']
                        }}
                        value={values?.attachment}
                        setFieldValue={setFieldValue}
                        current={values?.attachment}
                        returnObject="url"
                        compact
                        required
                      />
                      <TextEditor
                        label="Content"
                        name="content"
                        setFieldValue={setFieldValue}
                        value={values?.content}
                        height={250}
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
