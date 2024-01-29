import { confirm } from '@components/ConfirmationBox'
import { Loading } from '@components/Icons'
import { useMe } from '@hooks/useMe'
import { WEBSITE_BLOG_CATEGORIES } from '@src/restapi/blogs/constants'
import { deleteBlogCategory } from '@src/restapi/blogs/mutation'
import { huslWebStorageUrl } from '@utils/index'
import Link from 'next/link'
import { useMemo } from 'react'
import { MdCheck, MdClose, MdDelete, MdEdit } from 'react-icons/md'
import { toast } from 'react-toastify'
import useSWR, { mutate } from 'swr'
import { DataTable } from '../CoreDatatable'

export const BlogCategoriesTable: React.FC = () => {
  const { data: user } = useMe()
  const fetchKey = user?.data?.websiteKey ? WEBSITE_BLOG_CATEGORIES : null
  const { data: categories, error } = useSWR<RestApi.WebHuslPaginate<BlogCategory[]>>(fetchKey)

  const handleDeleteBlog = async (blogId: string) => {
    const confirmation = await confirm('Are you sure you want to delete this category?', 'Delete', 'Cancel')
    if (confirmation) {
      try {
        await deleteBlogCategory(blogId)
        toast.success('Blog category deleted successfully.')
        mutate?.(fetchKey)
      } catch (error: any) {
        toast.error(error?.message || 'Something went wrong while deleting user. Please try again later.')
      }
    }
  }

  const columns = useMemo(() => {
    return [
      {
        Header: '#',
        accessor: 'thumb',
        disableSortBy: true,
        Cell: (c: any) => {
          const row = c?.row?.original
          if (!row?.thumb) {
            return <></>
          }
          return <img src={huslWebStorageUrl(`/blogs/categories/${row?.thumb}`)} width={48} height={48} />
        }
      },
      {
        Header: 'Name',
        accessor: 'name',
        width: '30rem'
      },
      {
        Header: 'Featured',
        accessor: 'is_featured',
        disableSortBy: true,
        Cell: (c: any) => {
          const row = c?.row?.original
          return (
            <div className="pl-5 text-lg">
              {row?.is_featured ? <MdCheck className="text-success" /> : <MdClose className="text-danger" />}
            </div>
          )
        }
      },
      {
        Header: 'Active',
        accessor: 'is_active',
        disableSortBy: true,
        Cell: (c: any) => {
          const row = c?.row?.original
          return (
            <div className="pl-5 text-lg">
              {row?.is_active ? <MdCheck className="text-success" /> : <MdClose className="text-danger" />}
            </div>
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
              <Link href={`/blog/categories/${row?.id}`}>
                <a className="text-lg underline text-primary" title="Edit">
                  <MdEdit />
                </a>
              </Link>
              <button
                onClick={() => handleDeleteBlog(row?.id)}
                className="text-lg underline text-primary hover:text-danger"
                title="Delete">
                <MdDelete />
              </button>
            </div>
          )
        }
      }
    ]
  }, [categories])

  if (!categories && !error) {
    return <Loading />
  }
  return (
    <DataTable
      columns={columns}
      data={categories || []}
      loading={!categories && !error}
      showSearch
      searchOnHeader
      limitOptions={[5, 10, 15, 20]}
      totalData={0}
      initialState={{
        hiddenColumns: ['role']
      }}
    />
  )
}
