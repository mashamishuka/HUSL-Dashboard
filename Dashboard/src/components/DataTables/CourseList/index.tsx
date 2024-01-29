import Link from 'next/link'
import { useMemo, useState } from 'react'
import { IoMdEye } from 'react-icons/io'
import { MdDelete, MdEdit } from 'react-icons/md'
import { toast } from 'react-toastify'
import useSWR from 'swr'

import { confirm } from '@components/ConfirmationBox'
import { Toggler } from '@components/Forms/components'
import { EditCourse } from '@components/Modals/EditCourse'
import { GET_COURSES } from '@src/restapi/course/constant'
import { deleteCourse, editCourse } from '@src/restapi/course/mutations'

import { DataTable } from '../CoreDatatable'

export const CourseListTable: React.FC = () => {
  const { data, isLoading, mutate } = useSWR<RestApi.Response<Course.Course[]>>(GET_COURSES)
  const [editModal, setEditModal] = useState<{
    state: boolean
    data: Course.Course | null
  }>({
    state: false,
    data: null
  })

  const handleEdit = async (id: string, data?: Record<string, any>) => {
    try {
      await editCourse(id, data)
      mutate()
      toast.success('Course updated successfully')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Something went wrong')
    }
  }

  const handleDelete = async (id: string) => {
    const confirmation = await confirm('Are you sure you want to delete this course?')
    if (!confirmation) return
    try {
      await deleteCourse(id)
      mutate()
      toast.success('Course deleted successfully')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Something went wrong')
    }
  }
  const columns = useMemo(() => {
    return [
      {
        Header: 'Title',
        accessor: 'title',
        width: '30rem',
        Cell: (c: any) => {
          const row = c?.row?.original
          return <Link href={`/admin/generator/courses/${row?._id}`}>{row?.title}</Link>
        }
      },
      {
        Header: 'Chapters',
        accessor: 'chapters',
        Cell: (c: any) => {
          const row = c?.row?.original
          return <span>{row?.chapters?.length || 0}</span>
        }
      },
      {
        Header: 'Topics',
        accessor: 'topics',
        Cell: (c: any) => {
          const row = c?.row?.original
          const topicCount = row?.chapters?.reduce((acc: any, curr: any) => {
            return acc + curr?.topics?.length
          }, 0)
          return <span>{topicCount || 0}</span>
        }
      },
      {
        Header: 'Participants',
        accessor: 'participants',
        Cell: () => {
          // const row = c?.row?.original
          return 0
        }
      },
      {
        Header: 'Published',
        accessor: 'published',
        disableSortBy: true,
        Cell: (c: any) => {
          const row = c?.row?.original

          return (
            <Toggler
              defaultChecked={row?.published}
              onSwitch={(state) => {
                if (row?.published === state) return
                handleEdit(row?._id, { published: state })
              }}
            />
          )
        }
      },
      {
        Header: () => <p className="text-right">Action</p>,
        accessor: 'slug',
        disableSortBy: true,
        Cell: (c: any) => {
          const row = c?.row?.original
          return (
            <div className="flex justify-end space-x-3 text-left">
              <button
                className="text-lg underline text-primary"
                title="Edit"
                onClick={() =>
                  setEditModal({
                    state: true,
                    data: row
                  })
                }>
                <MdEdit />
              </button>
              <Link href={`/admin/generator/courses/${row?._id}`}>
                <a className="text-lg underline text-primary" title="Edit">
                  <IoMdEye />
                </a>
              </Link>
              <button
                className="text-lg underline text-primary hover:text-danger"
                title="Delete"
                onClick={() => handleDelete(row?._id)}>
                <MdDelete />
              </button>
            </div>
          )
        }
      }
    ]
  }, [])

  return (
    <>
      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        showSearch
        searchOnHeader
        limitOptions={[5, 10, 15, 20]}
        totalData={0}
        initialState={{
          hiddenColumns: ['role']
        }}
      />
      <EditCourse
        show={editModal.state}
        data={editModal.data}
        onEdit={handleEdit}
        onClose={() =>
          setEditModal({
            ...editModal,
            state: false
          })
        }
      />
    </>
  )
}
