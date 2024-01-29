import { confirm } from '@components/ConfirmationBox'
import { EncryptedText } from '@components/EncryptedText'
import { EditAccountCompact } from '@components/Forms/EditAccountCompact'
import { CompactModal } from '@components/Modals'
import { Account, AccountDto } from '@src/restapi/accounts/account'
import { GET_ALL_ACCOUNT } from '@src/restapi/accounts/constants'
import { deleteAccount } from '@src/restapi/accounts/mutation'
import clsx from 'clsx'
import { useState } from 'react'
import { MdDelete, MdEdit, MdVerified } from 'react-icons/md'
import { toast } from 'react-toastify'
import useSWR from 'swr'

export const AccessManagerTable = () => {
  const [edit, setEdit] = useState<{
    state: boolean
    pos: {
      x: number
      y: number
    }
    data?: AccountDto & {
      _id: string
    }
  }>({
    state: false,
    pos: {
      x: 0,
      y: 0
    },
    data: undefined
  })
  const { data, mutate } = useSWR<RestApi.Response<Account[]>>(GET_ALL_ACCOUNT)

  const handleDelete = async (id: string) => {
    const confirmation = await confirm('Are you sure you want to delete this account?')
    if (confirmation) {
      try {
        const account = await deleteAccount(id)
        if (account) {
          toast.success('Account deleted successfully')
          mutate?.()
        } else {
          toast.error('Failed to delete account')
        }
      } catch (_) {
        toast.error('Failed to delete account')
      }
    }
  }

  return (
    <>
      <table className="w-full text-left table-auto">
        <thead>
          <tr className="border-b border-white border-opacity-20">
            <th className="px-3 py-2 font-light md:px-0">Verified</th>
            <th className="px-3 py-2 font-light md:px-0">Website List</th>
            <th className="px-3 py-2 font-light md:px-0">Username</th>
            <th className="px-3 py-2 font-light lg:w-60 md:px-0">Password</th>
            <th className="px-3 py-2 font-light md:px-0">Action</th>
          </tr>
        </thead>
        <tbody>
          {data?.data?.map((account, index) => (
            <tr key={index}>
              <td className="px-3 py-2 md:px-0">
                <MdVerified className={clsx('text-2xl', account.verified && 'text-primary')} />
              </td>
              <td className="px-3 py-2 md:px-0">{account?.websiteKey}</td>
              <td className="px-3 py-2 md:px-0">{account?.username}</td>
              <td className="px-3 py-2 md:px-0">
                <EncryptedText text={account?.password} />
              </td>
              <td className="flex items-center w-10 px-3 py-2 space-x-2 text-lg md:px-0">
                <button
                  onClick={(e) => {
                    setEdit({
                      ...edit,
                      state: !edit.state,
                      pos: {
                        x: e.clientX,
                        y: e.clientY
                      },
                      data: account
                    })
                  }}>
                  <MdEdit />
                </button>
                <button onClick={() => handleDelete(account?._id)} className="text-danger">
                  <MdDelete />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <CompactModal
        show={edit.state}
        onClose={() =>
          setEdit({
            ...edit,
            state: false
          })
        }
        pos={{
          x: edit?.pos?.x || 0,
          y: edit?.pos?.y || 0
        }}>
        <p className="mb-3">Edit account</p>
        <EditAccountCompact data={edit?.data} />
      </CompactModal>
    </>
  )
}
