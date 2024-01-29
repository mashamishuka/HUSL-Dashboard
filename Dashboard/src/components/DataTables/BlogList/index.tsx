import { confirm } from '@components/ConfirmationBox'
import { Toggler } from '@components/Forms/components'
import { useMe } from '@hooks/useMe'
import { WEBSITE_BLOG_LIST } from '@src/restapi/blogs/constants'
import { deleteBlogPost, editBlogPost } from '@src/restapi/blogs/mutation'
import { addHttp, huslWebStorageUrl } from '@utils/index'
import Link from 'next/link'
import { useMemo } from 'react'
import { MdCheck, MdClose, MdDelete, MdEdit, MdPreview } from 'react-icons/md'
import { toast } from 'react-toastify'
import useSWR, { mutate } from 'swr'
import { DataTable } from '../CoreDatatable'

export const BlogListTable: React.FC = () => {
  const { data: user } = useMe()
  const fetchKey = user?.data?.websiteKey ? WEBSITE_BLOG_LIST + `&landingpage_id=${user?.data?.websiteKey}` : null
  const { data: blogs, error } = useSWR<RestApi.WebHuslPaginate<Blog[]>>(fetchKey)

  const handleDeleteBlog = async (blogId: string) => {
    const confirmation = await confirm('Are you sure you want to delete this post?', 'Delete', 'Cancel')
    if (confirmation) {
      try {
        await deleteBlogPost(blogId, user?.data?.websiteKey)
        toast.success('Blog post deleted successfully.')
        mutate?.(fetchKey)
      } catch (error: any) {
        toast.error(error?.message || 'Something went wrong while deleting user. Please try again later.')
      }
    }
  }
  const changePublishState = async (data: Record<string, any>, isPublished: boolean) => {
    if (data.is_published == isPublished) return
    try {
      const { id, is_featured } = data
      const formData = new FormData()
      if (isPublished == true) {
        formData.append('is_published', 'true')
      }
      if (is_featured) {
        formData.append('is_featured', 'true')
      }
      formData.append('is_active', 'true')
      formData.append('_method', 'PATCH')
      await editBlogPost(id, formData)
      toast.success(`Blog post ${isPublished ? 'published' : 'un-published'} successfully.`)
      mutate?.(fetchKey)
    } catch (error: any) {
      toast.error(error?.message || 'Something went wrong while deleting user. Please try again later.')
    }
  }
  const data = useMemo(() => {
    if (!blogs) return []
    return blogs?.data?.map((blog) => blog)
  }, [blogs])

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
          return <img src={huslWebStorageUrl(`/blogs/thumbnails/${row?.thumb}`)} width={48} height={48} />
        }
      },
      {
        Header: 'Title',
        accessor: 'title',
        width: '30rem'
      },
      {
        Header: 'Category',
        accessor: 'category.name'
      },
      {
        Header: 'Website',
        accessor: 'landing_page.custom_domain'
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
        Header: 'Published',
        accessor: 'is_published',
        disableSortBy: true,
        Cell: (c: any) => {
          const row = c?.row?.original
          return <Toggler defaultChecked={row?.is_published} onSwitch={(state) => changePublishState(row, state)} />
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
              <Link href={`/blog/${row?.id}`}>
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
              <a
                href={
                  addHttp(row?.landing_page?.custom_domain || row?.landing_page?.sub_domain) +
                  `/blog/${row?.slug}/${row?.id}`
                }
                className="text-lg underline text-primary hover:text-danger"
                title="Preview"
                target="_blank">
                <MdPreview />
              </a>
            </div>
          )
        }
      }
    ]
  }, [blogs])

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={!blogs && !error}
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
