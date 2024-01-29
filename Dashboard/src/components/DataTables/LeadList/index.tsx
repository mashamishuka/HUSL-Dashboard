import { useMemo, useState } from 'react'

import { DataTable } from '@components/DataTables/CoreDatatable'
import { MdNoteAdd, MdSearch } from 'react-icons/md'
import { AddLeadsNoteModal } from '@components/Modals/AddLeadsNote'
import { GET_LEADS } from '@src/restapi/niche/constants'
import QueryString from 'qs'
import useSWR from 'swr'
import { useActiveBusiness } from '@hooks/useActiveBusiness'
import moment from 'moment'
import { Input } from '@components/Forms/components/Input'
import { Pagination } from '@components/Pagination'
import { SingleSelect } from '@components/Forms/components'
import { updateLeads } from '@src/restapi/niche/mutation'
import { toast } from 'react-toastify'

const statusList = [
  {
    label: 'New',
    value: 'new'
  },
  {
    label: 'Contacted',
    value: 'contacted'
  },
  {
    label: 'Warm',
    value: 'warm'
  },
  {
    label: 'Not Interested',
    value: 'not-interested'
  },
  {
    label: 'MIA',
    value: 'mia'
  },
  {
    label: 'Sold',
    value: 'sold'
  }
]
export const LeadList: React.FC = () => {
  const { business: activeBusiness } = useActiveBusiness()
  const [leadsNote, setLeadsNote] = useState<{
    show: boolean
    data?: any
  }>({
    show: false
  })
  const [params, setParams] = useState<Record<string, any>>({
    page: 1,
    limit: 10,
    _q: null,
    business: activeBusiness?._id
  })

  const {
    data: leads,
    error,
    mutate
  } = useSWR<RestApi.Response<Leads[]>>(
    params?.business ? `${GET_LEADS}?${QueryString.stringify(params, { skipNulls: true })}` : null
  )

  const data = useMemo(() => {
    return leads?.data || []
  }, [leads])

  const handleSearch = (e: any) => {
    setParams({
      page: 1,
      limit: 10,
      business: activeBusiness?._id,
      _q: e?.target?.value
    })
  }

  const handleStatusChange = async (leadId: string, status?: any) => {
    try {
      await updateLeads(leadId, {
        status
      })
      mutate()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Something went wrong, please try again later')
    }
  }

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
        Header: 'Phone',
        accessor: 'phone'
      },
      {
        Header: () => <span className="no-newline">Created</span>,
        accessor: 'createdAt',
        Cell: ({ value }: any) => {
          return <span>{moment(value?.createdAt).format('LL LT')}</span>
        }
      },
      {
        Header: 'Notes',
        accessor: 'notes',
        Cell: ({ value }: any) => {
          return <span>{value?.length || 0}</span>
        }
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value, row }: any) => {
          const leadsId = row?.original?._id
          const label = statusList.find((item) => item.value === value)?.label
          return (
            <SingleSelect
              items={statusList}
              value={value}
              selectedLabel={label}
              onChange={(v) => handleStatusChange(leadsId, v)}
              hideSearch
              className="w-44"
            />
          )
        }
      },
      {
        Header: '#',
        accessor: 'actions',
        disableSortBy: true,
        width: 50,
        Cell: (c?: any) => {
          const row = c?.row?.original
          return (
            <div className="flex space-x-3">
              <button
                title="Add Notes"
                onClick={() =>
                  setLeadsNote({
                    show: true,
                    data: row
                  })
                }>
                <MdNoteAdd />
              </button>
            </div>
          )
        }
      }
    ]
  }, [])

  return (
    <div>
      <div className="flex justify-end mb-3 space-x-3">
        <Input
          placeholder="Search Data"
          prepend={<MdSearch className="text-lg" />}
          className="pl-10"
          onBlur={handleSearch}
          onKeyUp={(e) => e.key === 'Enter' && handleSearch(e)}
        />
      </div>
      <DataTable columns={columns} data={data} loading={!leads && !error} showOverflow />
      <div className="flex justify-center mt-5">
        <Pagination
          initialPage={leads?.meta?.page}
          pageCount={leads?.meta?.pageCount}
          onPageChange={(page?: number) => {
            if (page == params.page) return
            setParams({
              ...params,
              page
            })
          }}
        />
      </div>
      <AddLeadsNoteModal
        key={leadsNote?.data}
        show={leadsNote?.show}
        data={leadsNote?.data}
        mutate={mutate}
        onClose={() =>
          setLeadsNote({
            ...leadsNote,
            show: false
          })
        }
      />
    </div>
  )
}
