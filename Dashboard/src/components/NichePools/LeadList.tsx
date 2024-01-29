import { useMemo, useState, useEffect } from 'react'

import { DataTable } from '@components/DataTables/CoreDatatable'
import useSWR from 'swr'
import { GET_BUSINESS_IN_NICHE, GET_LEADS } from '@src/restapi/niche/constants'
import { useRouter } from 'next/router'
import { Pagination } from '@components/Pagination'
import QueryString from 'qs'
import { Input } from '@components/Forms/components/Input'
import { MdImportExport, MdSearch } from 'react-icons/md'
import Button from '@components/Button'
import { useToggle } from 'react-use'
import { ImportLeads } from '@components/Modals/ImportLeads'
import { Business } from '@src/restapi/businesses/business'
import moment from 'moment'
// import { SingleSelect } from '@components/Forms/components'
// import { updateLeads } from '@src/restapi/niche/mutation'
// import { toast } from 'react-toastify'

// const statusList = [
//   {
//     label: 'New',
//     value: 'new'
//   },
//   {
//     label: 'Contacted',
//     value: 'contacted'
//   },
//   {
//     label: 'Warm',
//     value: 'warm'
//   },
//   {
//     label: 'Not Interested',
//     value: 'not-interested'
//   },
//   {
//     label: 'MIA',
//     value: 'mia'
//   },
//   {
//     label: 'Sold',
//     value: 'sold'
//   }
// ]
export const LeadList: React.FC = () => {
  const { query } = useRouter()
  const [params, setParams] = useState<Record<string, any>>({
    page: 1,
    limit: 10,
    _q: null,
    niche: query?.id?.toString()
  })
  const [importModal, setImportModal] = useToggle(false)

  const {
    data: leads,
    error,
    mutate
  } = useSWR<RestApi.Response<Leads[]>>(
    query?.id?.toString() ? `${GET_LEADS}?${QueryString.stringify(params, { skipNulls: true })}` : null
  )

  const { data: businesses } = useSWR<
    RestApi.Response<{
      business: Business[]
      count: number
    }>
  >(query?.id ? GET_BUSINESS_IN_NICHE(query?.id?.toString()) : null)

  const handleSearch = (e: any) => {
    setParams({
      page: 1,
      limit: 10,
      nicheId: query?.id?.toString(),
      _q: e?.target?.value
    })
  }
  // const handleStatusChange = async (leadId: string, status?: any) => {
  //   try {
  //     await updateLeads(leadId, {
  //       status
  //     })
  //     mutate()
  //   } catch (error: any) {
  //     toast.error(error?.response?.data?.message || 'Something went wrong, please try again later')
  //   }
  // }
  const columns = useMemo(() => {
    return [
      {
        Header: 'Name',
        accessor: 'name'
      },
      {
        Header: 'Email',
        accessor: 'email'
      },
      {
        Header: 'Phone Number',
        accessor: 'phone'
      },
      {
        Header: 'Business Name',
        accessor: 'business.name'
      },
      {
        Header: 'Created At',
        accessor: 'createdAt',
        Cell: ({ value }: any) => {
          return <span>{moment(value?.createdAt).format('LL LT')}</span>
        }
      },
      {
        Header: 'Status',
        accessor: 'status'
      }
      // {
      //   Header: 'Status',
      //   accessor: 'status',
      //   Cell: ({ value, row }: any) => {
      //     const leadsId = row?.original?._id
      //     const label = statusList.find((item) => item.value === value)?.label
      //     return (
      //       <SingleSelect
      //         items={statusList}
      //         value={value}
      //         selectedLabel={label}
      //         onChange={(v) => handleStatusChange(leadsId, v)}
      //         hideSearch
      //       />
      //     )
      //   }
      // }
    ]
  }, [])

  useEffect(() => {
    return () => {
      setParams({
        page: 1,
        limit: 10,
        _q: null,
        niche: query?.id?.toString()
      })
    }
  }, [])
  return (
    <div>
      <div className="flex justify-end mb-3 space-x-3">
        <Button className="flex items-center space-x-2" onClick={() => setImportModal(true)}>
          <MdImportExport className="text-lg" />
          <span>Import Leads</span>
        </Button>
        <Input
          placeholder="Search Data"
          prepend={<MdSearch className="text-lg" />}
          className="pl-10"
          onBlur={handleSearch}
          onKeyUp={(e) => e.key === 'Enter' && handleSearch(e)}
        />
      </div>
      <DataTable
        columns={columns}
        data={leads?.data || []}
        loading={!leads && !error}
        initialState={{
          hiddenColumns: ['role']
        }}
      />
      <div className="flex justify-center mt-5">
        <Pagination
          initialPage={leads?.meta?.page}
          pageCount={leads?.meta?.pageCount}
          onPageChange={(page?: number) => {
            setParams({
              ...params,
              page
            })
          }}
        />
      </div>
      <ImportLeads
        show={importModal}
        onClose={() => setImportModal(false)}
        businessCount={businesses?.data?.count}
        businesses={businesses?.data?.business}
        mutate={mutate}
      />
    </div>
  )
}
