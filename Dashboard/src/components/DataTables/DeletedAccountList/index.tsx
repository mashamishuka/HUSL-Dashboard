import { confirm } from '@components/ConfirmationBox'
import { GET_USERS } from '@src/restapi/users/constants'
import { deleteUser, restoreUser } from '@src/restapi/users/mutation'
import { User } from '@src/restapi/users/user'
import { useSession } from 'next-auth/react'
import { useMemo } from 'react'
import { MdDelete, MdRestore } from 'react-icons/md'
import { toast } from 'react-toastify'
import useSWR, { mutate } from 'swr'
import { DataTable } from '../CoreDatatable'

export const DeletedAccountListTable: React.FC = () => {
  const { data: session } = useSession()
  const { data: users, error } = useSWR<RestApi.Response<User[]>>(GET_USERS + '?deleted=true')

  const handleRestore = async (userId: string) => {
    const confirmation = await confirm('Are you sure you want to restore this user?', 'Restore', 'Cancel', {
      title: 'Restore user?'
    })
    if (confirmation) {
      try {
        const user = await restoreUser(userId)
        if (user?.status === 200) {
          toast.success(user?.message)
          mutate?.(GET_USERS + '?deleted=true')
        } else {
          toast.error(user?.message)
        }
      } catch (error: any) {
        toast.error(error?.message || 'Something went wrong while deleting user. Please try again later.')
      }
    }
  }

  const handleDeleteUser = async (userId: string) => {
    const confirmation = await confirm(
      'Are you sure you want to PERMANENTLY delete this user? This action is irreversible.',
      'Delete',
      'Cancel',
      {
        title: 'Delete user?'
      }
    )
    if (confirmation) {
      try {
        const user = await deleteUser(userId)
        if (user?.status === 200) {
          toast.success(user?.message)
          mutate?.(GET_USERS + '?deleted=true')
        } else {
          toast.error(user?.message)
        }
      } catch (error: any) {
        toast.error(error?.message || 'Something went wrong while deleting user. Please try again later.')
      }
    }
  }

  const data = useMemo(() => {
    if (!users) return []
    return users?.data?.map((user) => ({
      id: user._id,
      name: user.name,
      nftId: user.nftId,
      addLater: user.addLater,
      websiteKey: user.websiteKey || '-',
      email: user.email || '-',
      company: user.company || '-',
      role: user.role
    }))
  }, [users])

  const columns = useMemo(() => {
    return [
      {
        Header: 'Website',
        accessor: 'websiteKey'
      },
      {
        Header: 'Name',
        accessor: 'name'
      },
      {
        Header: 'Email',
        accessor: 'email',
        width: '25%',
        disableSortBy: true
      },
      {
        Header: 'Company',
        accessor: 'company',
        disableSortBy: true
      },
      {
        Header: 'Role',
        accessor: 'role',
        show: false
      },
      {
        Header: () => <p className="text-right">Action</p>,
        accessor: 'action',
        disableSortBy: true,
        Cell: (c: any) => {
          return (
            <div className="flex justify-end space-x-3 text-left">
              <button
                onClick={() => handleRestore(c?.row?.original?.id)}
                className="text-lg underline text-primary"
                title="Restore">
                <MdRestore />
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
  )
}
