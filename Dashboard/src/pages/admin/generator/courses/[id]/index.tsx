import clsx from 'clsx'
import { NextLayoutComponentType } from 'next'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { MdAdd, MdChevronLeft, MdDelete, MdEdit } from 'react-icons/md'
import { toast } from 'react-toastify'
import useSWR from 'swr'

import Button from '@components/Button'
import { confirm } from '@components/ConfirmationBox'
import { AdminLayout } from '@components/Layouts/AdminLayout'
import { AddCourseChapter } from '@components/Modals/AddCourseChapter'
import { AddCourseTopic } from '@components/Modals/AddCourseTopic'
import { EditCourseChapter } from '@components/Modals/EditCourseChapter'
import { EditCourseTopic } from '@components/Modals/EditCourseTopic'
import { Disclosure, Transition } from '@headlessui/react'
import { GET_COURSES } from '@src/restapi/course/constant'
import { deleteChapter, deleteTopic } from '@src/restapi/course/mutations'

const CourseTopicGenerator: NextLayoutComponentType = () => {
  const { push, query } = useRouter()
  const { data, mutate } = useSWR<RestApi.Response<Course.Course>>(query?.id ? `${GET_COURSES}/${query?.id}` : null)

  const [editChapter, setEditChapter] = useState<{
    state: boolean
    data: Course.Chapter | null
  }>({
    state: false,
    data: null
  })
  const [showAddChapter, setShowAddChapter] = useState(false)
  const [editTopic, setEditTopic] = useState<{
    state: boolean
    data: Course.Topic | null
    chapterId?: string | null
  }>({
    state: false,
    data: null,
    chapterId: null
  })
  const [addTopic, setAddTopic] = useState<{
    state: boolean
    data: Course.Chapter | null
  }>({
    state: false,
    data: null
  })

  const handleDeleteChapter = async (chapterId: string) => {
    if (!data?.data?._id) return
    const confirmation = await confirm('Are you sure you want to delete this chapter?')
    if (!confirmation) return
    try {
      await deleteChapter(data?.data?._id, chapterId)
      mutate?.()
      toast.success('Chapter successfully deleted.')
    } catch (error: any) {
      console.log(error)
      toast.error(error?.response?.data?.message || 'Something went wrong, please try again later.')
    }
  }

  const handleDeleteTopic = async (chapterId: string, topicId: string) => {
    if (!data?.data?._id) return
    const confirmation = await confirm('Are you sure you want to delete this topic?')
    if (!confirmation) return
    try {
      await deleteTopic(data?.data?._id, chapterId, topicId)
      mutate?.()
      toast.success('Topic successfully deleted.')
    } catch (error: any) {
      console.log(error)
      toast.error(error?.response?.data?.message || 'Something went wrong, please try again later.')
    }
  }

  return (
    <div className="flex flex-col space-y-5">
      <button onClick={() => push('/admin/generator/courses')} className="flex items-center space-x-2">
        <MdChevronLeft size={16} />
        <span>Back to Course List</span>
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl">{data?.data?.title}</h1>

        <Button className="flex items-center space-x-1" onClick={() => setShowAddChapter(true)}>
          <MdAdd />
          <span>Add Chapter</span>
        </Button>
      </div>
      <div className="flex flex-col space-y-3">
        {data?.data?.chapters?.map((chapter, index) => (
          <Disclosure key={index}>
            {({ open }) => (
              <div className="p-1 bg-secondary rounded-xl">
                <Disclosure.Button
                  className={clsx('flex px-3 md:px-5 space-x-3 py-3 transition-all items-center justify-between w-full')}>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{chapter.title}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      className="text-lg underline text-primary"
                      title="Edit"
                      onClick={() =>
                        setEditChapter({
                          state: true,
                          data: chapter
                        })
                      }>
                      <MdEdit />
                    </button>
                    <button
                      className="text-lg underline text-primary hover:text-danger"
                      title="Delete"
                      onClick={() => handleDeleteChapter(chapter?._id)}>
                      <MdDelete />
                    </button>
                    <MdChevronLeft
                      className={clsx(
                        'text-2xl transform transition-transform opacity-70',
                        open ? 'rotate-90' : '-rotate-90'
                      )}
                    />
                  </div>
                </Disclosure.Button>

                <Transition
                  enter="transition duration-100 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-75 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                  className={clsx('flex flex-col space-y-2 p-5', open && 'border-t border-t-gray-600')}>
                  <>
                    {chapter?.topics?.map((topic, i) => (
                      <Disclosure.Panel
                        key={i}
                        as="div"
                        className="flex items-center justify-between px-5 py-3 border border-gray-600 rounded-xl">
                        <div className="flex space-x-10">
                          <div>
                            <h4 className="text-lg">{topic?.title}</h4>
                            <span className="text-sm text-gray-300">Completion time: {topic?.completion_time}</span>
                          </div>
                          <div>
                            <h4 className="text-lg">${topic?.reward} HSL</h4>
                            <span className="text-sm text-gray-300">Reward</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-end space-x-3 text-left">
                            <button
                              className="text-lg underline text-primary"
                              title="Edit"
                              onClick={() =>
                                setEditTopic({
                                  state: true,
                                  data: topic,
                                  chapterId: chapter?._id
                                })
                              }>
                              <MdEdit />
                            </button>
                            <button
                              className="text-lg underline text-primary hover:text-danger"
                              title="Delete"
                              onClick={() => handleDeleteTopic(chapter?._id, topic?._id)}>
                              <MdDelete />
                            </button>
                          </div>
                        </div>
                      </Disclosure.Panel>
                    ))}
                    <button
                      className="flex items-center justify-center px-5 py-3 space-x-3 text-center border border-gray-600 border-dashed rounded-xl"
                      onClick={() =>
                        setAddTopic({
                          state: true,
                          data: chapter
                        })
                      }>
                      <MdAdd />
                      <span>Add New Topic</span>
                    </button>
                  </>
                </Transition>
              </div>
            )}
          </Disclosure>
        ))}
      </div>

      <AddCourseChapter
        show={showAddChapter}
        onClose={() => setShowAddChapter(false)}
        mutate={mutate}
        courseId={data?.data?._id}
      />
      <EditCourseChapter
        show={editChapter.state}
        onClose={() =>
          setEditChapter({
            state: false,
            data: null
          })
        }
        data={editChapter?.data}
        courseId={data?.data?._id}
        mutate={mutate}
      />
      <AddCourseTopic
        show={addTopic.state}
        onClose={() =>
          setAddTopic({
            state: false,
            data: null
          })
        }
        data={addTopic?.data}
        courseId={data?.data?._id}
        mutate={mutate}
      />
      <EditCourseTopic
        show={editTopic.state}
        onClose={() =>
          setEditTopic({
            state: false,
            data: null,
            chapterId: null
          })
        }
        data={editTopic?.data}
        courseId={data?.data?._id}
        chapterId={editTopic?.chapterId}
        mutate={mutate}
      />
    </div>
  )
}

CourseTopicGenerator.getLayout = function getLayout(page) {
  return <AdminLayout children={page} />
}

export default CourseTopicGenerator
