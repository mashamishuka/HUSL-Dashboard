import { useMemo } from 'react'
import useSWR from 'swr'
import { DataTable } from '../CoreDatatable'
import { GET_PRODUCTS } from '@src/restapi/products/constants'
import { useWebsites } from '@hooks/useWebsites'
import Link from 'next/link'
import { MdDelete, MdEdit } from 'react-icons/md'
import { confirm } from '@components/ConfirmationBox'
import { toast } from 'react-toastify'
import { deleteProduct } from '@src/restapi/products/mutation'

export const ProductListTable: React.FC = () => {
  const { data: products, error, mutate } = useSWR<RestApi.Response<Product[]>>(GET_PRODUCTS)
  const { data: websites } = useWebsites()

  const websiteList = useMemo(() => {
    if (websites && websites?.length > 0) {
      return websites?.map((item) => ({
        label: item?.custom_domain || item?.sub_domain,
        value: item.code
      }))
    } else {
      return []
    }
  }, [websites])

  const handleDeleteProduct = async (product: Product) => {
    // prevent delete product if it has been used in niche
    if (product?.usedByNiches?.length) {
      await confirm('This product has been used in niche, you can not delete it', 'OK', '', {
        confirmText: 'OK',
        cancelText: '',
        title: 'Unable to delete'
      })
      return
    }
    try {
      const confirmation = await confirm('Are you sure you want to delete this product?')
      if (confirmation) {
        // call api to delete product
        await deleteProduct(product._id)
        toast.success('Product has been deleted')
        mutate()
      }
    } catch (error: any) {
      toast.error(error?.response?.message || 'Something went wrong, please try again later.')
    }
  }

  const data = useMemo(() => {
    if (!products) return []
    return products?.data
  }, [products])

  const columns = useMemo(() => {
    return [
      {
        Header: 'Name',
        accessor: 'name'
      },
      {
        Header: 'Website',
        accessor: 'websiteKey',
        Cell: ({ row }: any) => {
          const website = websiteList?.find((item) => item.value === row?.original?.websiteKey)
          return <span>{website?.label || '-'}</span>
        }
      },
      {
        Header: 'Short Ad Copy',
        accessor: 'shortAdCopy'
      },
      {
        Header: 'Long Ad Copy',
        accessor: 'longAdCopy',
        width: 350
      },
      // table action
      {
        Header: () => <p className="text-right">Action</p>,
        accessor: 'action',
        disableSortBy: true,
        Cell: (c: any) => {
          const row = c?.row?.original
          return (
            <div className="flex justify-end space-x-3 text-left">
              <Link href={`/admin/builder/product/${row?._id}`}>
                <a className="flex items-center space-x-2 text-primary" title="Edit">
                  <MdEdit />
                </a>
              </Link>
              <button
                onClick={() => handleDeleteProduct(row)}
                className="flex items-center space-x-2 text-primary hover:text-danger"
                title="Delete">
                <MdDelete />
              </button>
            </div>
          )
        }
      }
    ]
  }, [websiteList])

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={!products && !error}
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
