import { useMemo, useState } from 'react'
import { DataTable } from '../CoreDatatable'
import Link from 'next/link'
import { MdCheck, MdDelete, MdEdit, MdSearch } from 'react-icons/md'
import { confirm } from '@components/ConfirmationBox'
import { toast } from 'react-toastify'
import { useBusinesses } from '@hooks/useBusiness'
import Image from 'next/image'
import { deleteBusiness } from '@src/restapi/businesses/mutation'
import { BsX } from 'react-icons/bs'
import { Wrapper } from '@components/Layouts/Wrapper'
import Button from '@components/Button'
import { Pagination } from '@components/Pagination'
import { Input } from '@components/Forms/components/Input'

export const BusinessListTable: React.FC = () => {
  const [query, setQuery] = useState<Record<string, any>>({
    page: 1,
    limit: 10,
    _q: null
  })
  const { data: businesses, error, mutate } = useBusinesses(query)

  const data = useMemo(() => {
    if (!businesses) return []
    return businesses?.data
  }, [businesses])

  const meta = useMemo(() => {
    if (!businesses) return null
    return businesses?.meta
  }, [businesses])

  const handleDeleteBusiness = async (businessId: string) => {
    if (!businessId) return
    const confirmation = await confirm('Are you sure you want to delete this business?')
    if (!confirmation) return
    try {
      await deleteBusiness(businessId).then((res) => {
        if (res?.data) {
          toast.success('Business deleted successfully.')
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
        Header: '#',
        accessor: 'logo',
        Cell: ({ row }: any) => {
          return <Image src={row?.original?.logo?.url} width={100} height={70} className="object-cover rounded-md" />
        }
      },
      {
        Header: 'Name',
        accessor: 'name'
      },
      {
        Header: 'Color',
        accessor: 'primaryColor',
        Cell: ({ row }: any) => {
          return (
            <div className="flex items-center space-x-2">
              <div
                title="Primary Color"
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: row?.original?.primaryColor }}
              />
              <div
                title="Secondary Color"
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: row?.original?.secondaryColor }}
              />
            </div>
          )
        }
      },
      {
        Header: 'Niches',
        accessor: 'niche',
        Cell: ({ value }: any) => {
          return (
            <div className="flex flex-col space-y-1">
              <Link key={value?._id} href={`/admin/builder/niches/${value?._id}`}>
                <a className="text-primary hover:underline">{value?.name}</a>
              </Link>
            </div>
          )
        }
      },
      {
        Header: 'Product',
        accessor: 'product',
        Cell: ({ value }: any) => {
          return (
            <div className="flex flex-col space-y-1">
              <Link key={value?._id} href={`/admin/builder/product/${value?._id}`}>
                <a className="text-primary hover:underline">{value?.name}</a>
              </Link>
            </div>
          )
        }
      },
      {
        Header: 'Generated',
        accessor: 'generated',
        disableSortBy: true,
        width: '50px',
        Cell: (c: any) => {
          if (c?.row?.original?.generated) {
            return <MdCheck className="text-center text-primary" />
          } else {
            return <BsX className="text-danger" />
          }
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
              <Link href={`/admin/builder/business/${row?._id}`}>
                <a className="flex items-center space-x-2 text-primary" title="Edit">
                  <MdEdit />
                </a>
              </Link>
              <button
                onClick={() => handleDeleteBusiness(row?._id)}
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
      title="Business"
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
            <Button text="Create New Business" url="/admin/builder/business/create" />
          </div>
        </div>
      }>
      <div className="max-w-full py-5 -mt-4 overflow-x-auto md:py-0 md:mt-0">
        <DataTable
          columns={columns}
          data={data}
          loading={!businesses && !error}
          showSearch
          searchOnHeader
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
    </Wrapper>
  )
}
