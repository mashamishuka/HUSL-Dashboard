import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { DataTable } from '../CoreDatatable'
import { GET_NICHES } from '@src/restapi/niche/constants'
import Link from 'next/link'
import { MdDelete, MdDownload, MdEdit, MdPoll, MdSearch } from 'react-icons/md'
import { confirm } from '@components/ConfirmationBox'
import { deleteNiche } from '@src/restapi/niche/mutation'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import QueryString from 'qs'
import { Pagination } from '@components/Pagination'
import { Wrapper } from '@components/Layouts/Wrapper'
import { Input } from '@components/Forms/components/Input'
import Button from '@components/Button'
import { ImportMasterLeads } from '@components/Modals/ImportMasterLeads'

export const NicheListTable: React.FC = () => {
  const [query, setQuery] = useState<Record<string, any>>({
    page: 1,
    limit: 10,
    _q: null
  })
  const [importLeadsModal, setImportLeadsModal] = useState(false)
  const {
    data: niches,
    error,
    mutate
  } = useSWR<RestApi.Response<Product[]>>(
    `${GET_NICHES}?${QueryString.stringify(query, {
      skipNulls: true
    })}`
  )
  const router = useRouter()

  const data = useMemo(() => {
    if (!niches) return []
    return niches?.data
  }, [niches])

  const meta = useMemo(() => {
    if (!niches) return null
    return niches?.meta
  }, [niches])

  const handleDeleteNiche = async (nicheId: string) => {
    if (!nicheId) return
    const confirmation = await confirm('Are you sure you want to delete this niche?')
    if (!confirmation) return
    try {
      await deleteNiche(nicheId).then((res) => {
        if (res?.data) {
          toast.success('Niche deleted successfully.')
          router?.push('/admin/builder/niche')
          mutate()
        }
      })
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Something went wrong. Please try again later.')
    }
  }
  const handleSearch = (e: any) => {
    setQuery({
      page: 1,
      limit: 10,
      _q: e?.target?.value
    })
  }

  const columns = useMemo(() => {
    return [
      {
        Header: 'Name',
        accessor: 'name'
      },
      {
        Header: 'Tag Copy',
        accessor: 'tagCopy',
        width: '50%',
        Cell: ({ value }: any) => {
          return (
            <div className="grid lg:grid-cols-2 gap-y-2 gap-x-2">
              {value?.map((tag: any) => (
                <div key={tag?.key} className="flex flex-col justify-center">
                  <span className="text-gray-500">{tag?.key}</span>
                  {/* <MdArrowRightAlt /> */}
                  <span>{tag?.value}</span>
                </div>
              ))}
            </div>
          )
        }
      },
      {
        Header: 'Products',
        accessor: 'products',
        Cell: ({ value }: any) => {
          return (
            <div className="flex flex-col justify-start space-y-1">
              {value?.map((product: any) => (
                <Link key={product?._id} href={`/admin/builder/product/${product?._id}`}>
                  <a className="text-primary hover:underline">{product?.name}</a>
                </Link>
              ))}
            </div>
          )
        }
      },
      {
        Header: () => <p className="text-right">Action</p>,
        accessor: 'action',
        disableSortBy: true,
        Cell: (c: any) => {
          const row = c?.row?.original
          return (
            <div className="flex justify-end space-x-3 text-left">
              <Link href={`/admin/builder/niche/${row?._id}/pools`}>
                <a className="flex items-center space-x-2 text-primary" title="Edit">
                  <MdPoll />
                </a>
              </Link>
              <Link href={`/admin/builder/niche/${row?._id}`}>
                <a className="flex items-center space-x-2 text-primary" title="Edit">
                  <MdEdit />
                </a>
              </Link>
              <button
                onClick={() => handleDeleteNiche(row?._id)}
                className="flex items-center space-x-2 text-primary hover:text-danger"
                title="Delete">
                <MdDelete />
              </button>
            </div>
          )
        }
      }
    ]
  }, [data])

  return (
    <Wrapper
      title="Niche"
      actionEl={
        <div className="flex space-x-3">
          <Input
            placeholder="Search Data"
            prepend={<MdSearch className="text-lg" />}
            className="pl-10"
            onBlur={handleSearch}
            onKeyUp={(e) => e.key === 'Enter' && handleSearch(e)}
          />
          <div className="relative flex items-center space-x-3">
            <Button
              className="relative items-center hidden space-x-3"
              variant="outline"
              onClick={() => setImportLeadsModal(true)}>
              <MdDownload />
              <span>Import Leads</span>
            </Button>
            <Button text="Create New Niche" url="/admin/builder/niche/create" />
          </div>
        </div>
      }>
      <div className="max-w-full py-5 -mt-4 overflow-x-auto md:py-0 md:mt-0">
        <DataTable
          columns={columns}
          data={data}
          loading={!niches && !error}
          limitOptions={[5, 10, 15, 20]}
          totalData={0}
          initialState={{
            hiddenColumns: ['role']
          }}
        />
        <div className="flex justify-center mt-5">
          <Pagination
            initialPage={meta?.page}
            pageCount={meta?.pageCount}
            onPageChange={(page?: number) => {
              setQuery({
                ...query,
                page
              })
            }}
          />
        </div>
      </div>
      <ImportMasterLeads show={importLeadsModal} onClose={() => setImportLeadsModal(false)} />
    </Wrapper>
  )
}
