import { MdEdit } from 'react-icons/md'

import { CreateBusinessForm } from '@components/Forms/admin/BusinessBuilder/Builder'
import { AdminLayout } from '@components/Layouts/AdminLayout'
import { Wrapper } from '@components/Layouts/Wrapper'

import type { NextLayoutComponentType } from 'next'
import { useToggle, useUpdateEffect } from 'react-use'
import { Input } from '@components/Forms/components/Input'
import { useRouter } from 'next/router'
import { useBusiness } from '@hooks/useBusiness'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { updateBusiness } from '@src/restapi/businesses/mutation'

const CreateBusinessPage: NextLayoutComponentType = () => {
  const [title, setTitle] = useState('')
  const [editTitleState, setEditTitleState] = useToggle(false)

  const { query } = useRouter()
  const businessId = query?.businessId as string

  const { data, mutate } = useBusiness(businessId)

  const handleEditBusinessTitle = async () => {
    try {
      await updateBusiness(businessId, { name: title })
      setEditTitleState(false)
      mutate?.()
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Something went wrong. Please try again later.')
    }
    setEditTitleState(false)
  }

  useUpdateEffect(() => {
    if (data?.data?.name) {
      setTitle(data?.data?.name)
    } else {
      setTitle('')
    }
  }, [data])
  return (
    <div>
      <Wrapper
        title={
          <div>
            <div className="flex items-center space-x-1">
              <span>Manage Business ({data?.data?.name})</span>
              <button onClick={setEditTitleState}>
                <MdEdit className="text-sm" />
              </button>
            </div>
            {editTitleState && (
              <Input
                placeholder="Enter New Business Title"
                className="mt-3"
                value={title}
                onChange={(e) => setTitle(e.currentTarget?.value)}
                onKeyUp={(e) => {
                  if (e.key === 'Enter') {
                    // TODO make patch request to edit business title
                    handleEditBusinessTitle()
                  }
                }}
              />
            )}
          </div>
        }
        className="flex flex-col space-y-5">
        <CreateBusinessForm />
      </Wrapper>
    </div>
  )
}

CreateBusinessPage.getLayout = function getLayout(page) {
  return <AdminLayout children={page} />
}

export default CreateBusinessPage
