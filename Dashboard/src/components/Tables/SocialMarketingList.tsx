import { MdDelete, MdEdit, MdVerified } from 'react-icons/md'

import useSWR from 'swr'
import { SocialAccount, SocialAccountDto } from '@src/restapi/accounts/account'
import { GET_ALL_SOCIAL_ACCOUNT } from '@src/restapi/accounts/constants'
import { EncryptedText } from '@components/EncryptedText'
import * as Social from '@components/Socials'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { deleteSocialAccount } from '@src/restapi/accounts/mutation'
import { confirm } from '@components/ConfirmationBox'
import { CompactModal } from '@components/Modals'
import { EditSocialCompact } from '@components/Forms/EditSocialCompact'
import { useActiveBusiness } from '@hooks/useActiveBusiness'

export const SocialMarketingListTable = () => {
  const [edit, setEdit] = useState<{
    state: boolean
    pos: {
      x: number
      y: number
    }
    data?: SocialAccountDto & {
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
  const { business: activeBusiness } = useActiveBusiness()
  const { data, mutate } = useSWR<RestApi.Response<SocialAccount[]>>(
    activeBusiness ? GET_ALL_SOCIAL_ACCOUNT + `?businessId=${activeBusiness._id}` : GET_ALL_SOCIAL_ACCOUNT
  )

  const handleDelete = async (id: string) => {
    const confirmation = await confirm('Are you sure you want to delete this social account?')
    if (confirmation) {
      try {
        const account = await deleteSocialAccount(id)
        if (account) {
          toast.success('Social account deleted successfully')
          mutate?.()
        } else {
          toast.error('Failed to delete social account')
        }
      } catch (_) {
        toast.error('Failed to delete soocial account')
      }
    }
  }

  return (
    <>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white border-opacity-20">
            <th className="block w-10 py-2 font-light md:px-0">Social</th>
            <th className="py-2 pr-5 font-light md:px-0">Verified</th>
            {/* <th className="block py-2 pr-5 font-light md:px-0 w-44 md:w-auto">Website List</th> */}
            <th className="py-2 pr-24 font-light md:pr-5 md:px-0">Username</th>
            <th className="px-3 py-2 font-light lg:w-60 md:px-0">Password</th>
            <th className="px-3 py-2 font-light md:px-0">Action</th>
          </tr>
        </thead>
        <tbody>
          {data?.data?.map((social, index) => (
            <tr key={index}>
              <td className="flex items-center py-2 space-x-2">
                {social?.social === 'fb' && <Social.Facebook username={social?.username || ''} />}
                {social?.social === 'ig' && <Social.Instagram username={social?.username || ''} />}
                {social?.social === 'twitter' && <Social.Twitter username={social?.username || ''} />}
                {social?.social === 'tiktok' && <Social.Tiktok username={social?.username || ''} />}
              </td>
              <td className="py-2">
                <MdVerified className="text-2xl text-primary" />
              </td>
              {/* <td className="py-2">{social?.websiteList}</td> */}
              <td className="py-2">{social?.username}</td>
              <td className="py-2">
                <EncryptedText text={social?.password} />
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
                      data: social
                    })
                  }}>
                  <MdEdit />
                </button>
                <button onClick={() => handleDelete(social?._id)} className="text-danger">
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
        <p className="mb-3">Edit social account</p>
        <EditSocialCompact data={edit?.data} />
      </CompactModal>
    </>
  )
}
