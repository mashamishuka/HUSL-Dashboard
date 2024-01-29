import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import QueryString from 'qs'
import { useMemo, useRef, useState } from 'react'
import { BsX } from 'react-icons/bs'
import { MdCheck, MdDelete, MdLogin, MdSearch, MdSettings } from 'react-icons/md'
import { TbJumpRope } from 'react-icons/tb'
import { toast } from 'react-toastify'
import useSWR, { mutate } from 'swr'

import { confirm } from '@components/ConfirmationBox'
import { AddUserForm } from '@components/Forms/AddUser'
import { Input } from '@components/Forms/components/Input'
import { Wrapper } from '@components/Layouts/Wrapper'
import { CompactModal } from '@components/Modals'
import { AddManualClientsModal } from '@components/Modals/AddManualClients'
import { NextPrev } from '@components/Pagination'
import { useGetActiveSubscriptions, useGetFlatrates } from '@hooks/usePurchases'
import api from '@services/api'
import { GET_USERS } from '@src/restapi/users/constants'
import { deleteUser } from '@src/restapi/users/mutation'
import { User } from '@src/restapi/users/user'
import { businessMinimalClient } from '@utils/index'

import { DataTable } from '../CoreDatatable'
import { AccountListFilter } from './Filter'

function flatrates_data_to_flatrates_by_user(flatrates_data: any) {
  const array = flatrates_data ? JSON.parse(JSON.stringify(flatrates_data)) : []
  const flatrates_by_user: Map<string, number> = new Map()
  for (let i = 0; i < array.length; i++) {
    const current = flatrates_by_user.get('' + array[i].user) || 0
    flatrates_by_user.set('' + array[i].user, current + (array[i].data ? array[i].data.quantity : array[i].customers))
  }
  return flatrates_by_user
}

const V2_URL = process.env.V2_URL

export const AccountListTable: React.FC = () => {
  const { push, query } = useRouter()
  const [params, setParams] = useState<Record<string, any>>({
    ...query,
    clients: true,
    page: 1,
    limit: 10,
    _q: null
  })

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
  const { data: flatrates, mutate: mutateFlatrates } = useGetFlatrates()
  const [addUserModal, setAddUserModal] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const active_subscriptions = useGetActiveSubscriptions('price_1MFPAGCOIb8tHxq5WuDeEww9')
  const subscribed_users: string[] | undefined = active_subscriptions?.data?.data?.map(({ user }) => user)

  const flatrates_by_user: Map<string, number> = flatrates_data_to_flatrates_by_user(flatrates?.data)

  const handleSignin = async (data: Record<string, any>) => {
    try {
      await signIn('user', {
        nftId: data.nftId,
        callbackUrl: `${V2_URL}/access-manager`
      })
    } catch (error: any) {
      toast.error(error)
    }
  }

  const handleSignV2 = async (data: Record<string, any>) => {
    try {
      const sign = await api
        .post('/users/login', {
          nftId: data.nftId
        })
        .then(({ data }) => data)
      window.open(`${V2_URL}/auth?token=${sign?.token}`, '_blank')
      // window.location.href = `${V2_URL}/auth?token=${sign?.token}`
    } catch (error: any) {
      toast.error(error)
    }
  }

  const handleFilter = (param?: Record<string, any>) => {
    setParams({
      ...params,
      ...param
    })
  }

  const handleDeleteUser = async (userId: string) => {
    const confirmation = await confirm('Are you sure you want to delete this user?', 'Delete', 'Cancel', {
      title: 'Delete user?'
    })
    if (confirmation) {
      try {
        const user = await deleteUser(userId)
        if (user?.status === 200) {
          toast.success(user?.message)
          mutate?.(GET_USERS)
        } else {
          toast.error(user?.message)
        }
      } catch (error: any) {
        toast.error(error?.message || 'Something went wrong while deleting user. Please try again later.')
      }
    }
  }

  const handleSearch = (e: any) => {
    setParams({
      page: 1,
      limit: 10,
      _q: e?.target?.value
    })
  }

  const data = useMemo(() => {
    if (!users) return []
    let res = users?.data
      ?.filter(({ nftId }: { nftId: string }) => nftId[0] !== '-')
      .map((user) => ({
        id: user._id,
        name: user.name,
        nftId: user.nftId,
        addLater: user.addLater,
        websiteKey: user.websiteKey || '',
        email: user.email || '',
        company: user.company || '',
        role: user.role,
        subscribed: subscribed_users ? (subscribed_users.includes(user._id) ? 'Yes' : '') : '...',
        clients: businessMinimalClient(user?.nftId, flatrates_by_user.get(user._id) || 0),
        delivered: user?.clients || 0,
        discordUsername: user?.discordUsername || '-',
        hasBusiness: !!user?.business?.length
      }))
    if (params?.isSubscribed) {
      res = res.filter(({ subscribed }) => subscribed === 'Yes')
    }
    return res
  }, [users, subscribed_users])

  const meta = useMemo(() => {
    if (!users) return null
    return users?.meta
  }, [users?.meta])

  const columns = useMemo(() => {
    return [
      {
        Header: 'NFT',
        accessor: 'nftId'
      },
      {
        Header: 'Name',
        accessor: 'name'
      },
      {
        Header: 'Discord Username',
        accessor: 'discordUsername',
        minWidth: '200px'
      },
      {
        Header: 'Company',
        accessor: 'company',
        disableSortBy: true
      },
      {
        Header: 'Subscribed',
        accessor: 'subscribed',
        disableSortBy: true
      },
      {
        Header: 'Orders',
        accessor: 'clients',
        Cell: (c: any) => {
          const row = c?.row?.original
          return (
            <button
              className="flex items-center space-x-1 hover:text-primary"
              onClick={() =>
                setAddManualClientState({
                  show: true,
                  data: row
                })
              }>
              <span>{row?.clients}</span>
              {/* <MdNoteAdd className="text-xs" /> */}
            </button>
          )
        }
      },
      {
        Header: 'Delivered',
        accessor: 'delivered',
        disableSortBy: true
      },
      {
        Header: 'Role',
        accessor: 'role',
        show: false
      },
      {
        Header: () => <span className="no-newline">Business</span>,
        accessor: 'hasBusiness',
        disableSortBy: true,
        Cell: (c: any) => {
          if (c?.row?.original?.hasBusiness) {
            return <MdCheck className="text-primary" />
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
          return (
            <div className="flex justify-end space-x-3 text-left">
              {c?.row?.original?.id != session?.user?._id && (
                <>
                  <button
                    onClick={() => handleSignin(c.row.original)}
                    className="text-lg text-left underline text-primary"
                    title="Login to old UI">
                    <TbJumpRope />
                  </button>
                  <button
                    onClick={() => handleSignV2(c.row.original)}
                    className="text-lg text-left underline text-primary"
                    title="Login">
                    <MdLogin />
                  </button>
                </>
              )}
              <button
                onClick={() => push(`/admin/settings/${c?.row?.original?.id}/profile`)}
                className="text-lg underline text-primary"
                title="Settings">
                <MdSettings />
              </button>
              <button
                onClick={() => handleDeleteUser(c?.row?.original?.id)}
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
    <>
      <Wrapper
        title="Accounts List"
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
              <AccountListFilter onFilter={handleFilter} initialParams={params} />
            </div>
            <button
              ref={buttonRef}
              onClick={() => setAddUserModal(!addUserModal)}
              className="flex items-center px-3 py-2 space-x-3 text-sm border rounded-lg border-primary text-primary">
              Create New User
            </button>
            <button
              onClick={() => push('/admin/accounts/trash')}
              className="flex items-center px-3 py-2 space-x-2 text-sm border rounded-lg border-danger text-danger">
              Deleted User
            </button>
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
    </>
  )
}
