import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import QueryString from 'qs'
import { useMemo, useRef, useState, useEffect } from 'react'
import { BsX } from 'react-icons/bs'
import { MdCheck, MdDelete, MdLogin, MdSearch, MdSettings } from 'react-icons/md'
import { TbJumpRope } from 'react-icons/tb'
import { confirm } from '@components/ConfirmationBox'
import { toast } from 'react-toastify'
import useSWR, { mutate } from 'swr'
import { AddUserForm } from '@components/Forms/AddUser'
import { Input } from '@components/Forms/components/Input'
import { Wrapper } from '@components/Layouts/Wrapper'
import { CompactModal } from '@components/Modals'
import { AddManualClientsModal } from '@components/Modals/AddManualClients'
import { NextPrev } from '@components/Pagination'
import { useGetActiveSubscriptions, useGetFlatrates } from '@hooks/usePurchases'

import { GET_USERS } from '@src/restapi/users/constants'
import { User } from '@src/restapi/users/user'
import { getAllNotification, deleteNotifications } from '@src/restapi/notifications/mutation'

import { DataTable } from '../CoreDatatable'
import { NotificationListFilter } from './Filter'
import { Notification } from '@src/restapi/notifications/notifications'

interface NotificationListTableProps {
  notifyModal: boolean
}

export const NotificationListTable: React.FC<NotificationListTableProps> = ({ notifyModal }) => {
  const { query } = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [params, setParams] = useState<Record<string, any>>({
    ...query,
    clients: true,
    page: 1,
    limit: 10,
    _q: null
  })

  useEffect(() => {
    const getNotify = async () => {
      const result = await getAllNotification()
      setNotifications(result.data)
    }
    getNotify()
  }, [notifyModal])
  const { data: session } = useSession()
  const {
    data: users,
    error,
    isLoading,
    mutate: mutateUsers
  } = useSWR<RestApi.Response<User[]>>(GET_USERS + '?' + QueryString.stringify(params, { skipNulls: true }))

  const [addManualClientState, setAddManualClientState] = useState<{ show: boolean; data?: Record<string, any> | null }>({
    show: false,
    data: null
  })
  const { mutate: mutateFlatrates } = useGetFlatrates()
  const [addUserModal, setAddUserModal] = useState(false)
  const [selectNotifications, setSelectnotifications] = useState([])
  const buttonRef = useRef<HTMLButtonElement>(null)
  const active_subscriptions = useGetActiveSubscriptions('price_1MFPAGCOIb8tHxq5WuDeEww9')
  const subscribed_users: string[] | undefined = active_subscriptions?.data?.data?.map(({ user }) => user)

  const deleteNotification = async (data: any) => {
    const confirmation = await confirm('Are you sure you want to delete this Notification?', 'Delete', 'Cancel', {
      title: 'Delete Notification?'
    })
    if (confirmation) {
      for (let i = 0; i < data.length; i++) {
        await deleteNotifications(data[i].original._id)
      }
      const result = await getAllNotification()
      setNotifications(result.data)
      toast.success('Notification deleted successfully.')
    }
  }

  const handleFilter = (param?: Record<string, any>) => {
    console.log(param)
    setParams({
      ...params,
      ...param
    })
  }

  const handleSearch = (e: any) => {
    setParams({
      page: 1,
      limit: 10,
      _q: e?.target?.value
    })
  }

  const data = useMemo(() => {
    let res = notifications.map((notification) => ({
      _id: notification._id,
      id: notification.name[0].label,
      title: notification.title,
      content: notification.content,
      timestamp: new Date(notification.createdAt).toDateString(),
      status: notification.status ? 'viewed' : 'pending',
      type: notification.type
    }))
    if (params?.pending) {
      res = res.filter(({ status }) => status === 'pending')
    } else if (params?.viewed) {
      res = res.filter(({ status }) => status === 'viewed')
    }
    if (params?._q?.length > 0) {
      res = res.filter(({ content }) => content?.toLowerCase().includes(params._q.toLowerCase()))
    }
    return res
  }, [users, subscribed_users, params?.pending, params?.viewed])

  const meta = useMemo(() => {
    if (!users) return null
    return users?.meta
  }, [users?.meta])

  const columns = useMemo(() => {
    return [
      {
        Header: 'User',
        accessor: 'id'
      },
      {
        Header: 'Title',
        accessor: 'title'
      },
      {
        Header: 'Content',
        accessor: 'content',
        Cell: ({ cell }) => <div title={cell.value}>{`${cell.value.slice(0, 15)} ...`}</div>
      },
      {
        Header: 'Created At',
        accessor: 'timestamp',
        minWidth: '200px'
      },
      {
        Header: 'Status',
        accessor: 'status'
      },
      {
        Header: 'Type',
        accessor: 'type'
      },
      {
        Header: () => <p className="text-center">Action</p>,
        accessor: 'action',
        Cell: (c: any) => {
          return (
            <div className="text-center">
              <button
                onClick={() => deleteNotification([c?.row])}
                className="text-lg underline text-primary hover:text-danger"
                title="Delete">
                <MdDelete />
              </button>
            </div>
          )
        }
      }
    ]
  }, [session])
  return (
    <div className="relative">
      <Wrapper
        title=""
        actionEl={
          <div className="relative flex items-center space-x-3">
            <Input
              placeholder="Search Data"
              prepend={<MdSearch className="text-lg" />}
              className="pl-10"
              onBlur={handleSearch}
              onKeyUp={(e) => e.key === 'Enter' && handleSearch(e)}
            />
            <div>
              <NotificationListFilter onFilter={handleFilter} initialParams={params} />
            </div>
          </div>
        }>
        <div className="max-w-full py-5 -mt-4 overflow-x-auto md:py-0 md:mt-0">
          <DataTable
            columns={columns}
            data={data}
            loading={!users && !error}
            showSearch
            searchOnHeader
            limitOptions={[5, 10, 15, 20]}
            totalData={0}
            showSelection={true}
            deleteNotifications={deleteNotification}
            initialState={{
              hiddenColumns: ['role']
            }}
          />
          <div className="flex justify-center mt-5">
            <NextPrev
              isLoading={isLoading}
              initialPage={meta?.page}
              dataPerPage={10}
              currentDataCount={data?.length}
              onPageChange={(page?: number) => {
                setParams({
                  ...params,
                  page
                })
              }}
            />
          </div>
        </div>
      </Wrapper>
      <CompactModal
        show={addUserModal}
        onClose={() => setAddUserModal(false)}
        pos={{
          x: (buttonRef.current?.getBoundingClientRect().x || 0) + (buttonRef?.current?.clientWidth || 0),
          y: (buttonRef.current?.getBoundingClientRect().y || 0) + (buttonRef?.current?.clientHeight || 0) + 20
        }}>
        <p className="mb-3">Create an end user account!</p>
        <AddUserForm />
      </CompactModal>
      <AddManualClientsModal
        show={addManualClientState?.show}
        data={addManualClientState?.data}
        mutate={async () => {
          await mutateFlatrates()
          mutateUsers()
        }}
        onClose={() =>
          setAddManualClientState({
            ...addManualClientState,
            show: false
          })
        }
      />
    </div>
  )
}
