import { MdDelete, MdEdit, MdMoreHoriz } from 'react-icons/md'

import { Avatar } from '@components/Avatar'
import { Dropdown } from '@components/Dropdowns'
import { callbackAvatar } from '@utils/lib/callbackAvatar'
import useSWR from 'swr'
import { GET_ALL_CUSTOMERS } from '@src/restapi/customers/constants'
import { Customer } from '@src/restapi/customers/customers'
import { deleteCustomer } from '@src/restapi/customers/mutation'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import { confirm } from '@components/ConfirmationBox'

export const GenericCRMListTable = () => {
  const router = useRouter()
  const { data: users, mutate } = useSWR<RestApi.Response<Customer[]>>(GET_ALL_CUSTOMERS)

  /**
   * TODO add confirm modal
   * @param id
   */
  const handleDeleteCustomer = async (id: string) => {
    const confirmation = await confirm('Are you sure you want to delete this customer?')
    if (!confirmation) return

    await deleteCustomer(id)
      .then((data) => {
        if (data?.status === 200 || data?.status === 201) {
          toast.success(data?.message)
          mutate()
        } else {
          toast.error(data?.message)
        }
      })
      .catch((e) => {
        toast.error(e?.response?.message || 'Something went wrong while deleting customer.')
      })
  }
  if (!users?.data?.length) {
    return <span>No Data</span>
  }
  return (
    <table className="w-full text-left table-fixed md:table-auto">
      <thead>
        <tr>
          <th className="w-56 py-2 pr-5 font-light md:w-auto md:pr-0">Name</th>
          <th className="py-2 font-light whitespace-nowrap w-72 md:w-auto">Email</th>
          <th className="w-48 py-2 font-light md:w-auto">Phone</th>
          <th className="w-20 py-2 font-light md:w-auto">Gender</th>
          <th className="w-10 md:w-auto"></th>
        </tr>
      </thead>
      <tbody>
        {users?.data?.map((user, index) => (
          <tr key={index}>
            <td className="flex items-center py-2 space-x-2">
              <div>
                <Avatar src={callbackAvatar(user?.profilePicture?.url, user?.fullname)} />
              </div>
              <span>{user?.fullname}</span>
            </td>
            <td className="py-2">{user?.email}</td>
            <td className="py-2">{user?.phone}</td>
            <td className="py-2">{user?.gender}</td>
            <td className="py-2 text-2xl">
              <Dropdown
                containerClass="justify-end"
                dropdownClass="-mt-5"
                text={
                  <button>
                    <MdMoreHoriz />
                  </button>
                }
                items={[
                  {
                    label: (
                      <div className="flex items-center space-x-2">
                        <MdEdit />
                        <span>Edit</span>
                      </div>
                    ),
                    onClick: () => router.push(`/customer-portal/${user?._id}`)
                  },
                  {
                    label: (
                      <div className="flex items-center space-x-2">
                        <MdDelete />
                        <span>Delete</span>
                      </div>
                    ),
                    onClick: () => handleDeleteCustomer(user?._id)
                  }
                ]}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
