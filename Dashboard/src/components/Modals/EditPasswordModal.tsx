import { Fragment } from 'react'

import { Dialog, Transition } from '@headlessui/react'
import { MdClose } from 'react-icons/md'
import Button from '@components/Button'
import { Formik } from 'formik'
import { Input } from '@components/Forms/components/Input'
import { toast } from 'react-toastify'
import { mutate } from 'swr'
import { GET_ME } from '@src/restapi/users/constants'
import { editUser } from '@src/restapi/users/mutation'
import { UserDto } from '@src/restapi/users/user'

interface DefaultModal {
  show: boolean
  // onShow?: boolean
  onClose?: () => void
  width?: string
  data?: any
}

export const EditPasswordModal: React.FC<DefaultModal> = ({ show, onClose, width = '32rem', data }) => {
  const handleEditPassword = async (values: UserDto) => {
    if (!data?.data?._id) return
    try {
      const editedUser = await editUser(data?.data?._id, values)
      toast.success('Password changed successfully!')
      mutate(GET_ME)
      onClose?.()
      return editedUser
    } catch (e: any) {
      toast.error(e?.message)
    }
  }
  return (
    <>
      <Transition appear show={show} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={() => onClose && onClose()}>
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0">
              <Dialog.Overlay className="fixed inset-0 bg-dark bg-opacity-10 backdrop-blur-sm" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95">
              <div
                className="relative inline-block w-full overflow-hidden text-left align-middle transition-all border rounded-lg shadow-lg bg-[#2B2A2A] border-dark p-5 max-w-full"
                style={{
                  width
                }}>
                <Formik
                  initialValues={{
                    currentPassword: '',
                    newPassword: ''
                  }}
                  onSubmit={handleEditPassword}>
                  {({ handleSubmit, handleBlur, handleChange, values, errors, isSubmitting }) => (
                    <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
                      <span>Edit Password</span>
                      <Input
                        label="Current Password"
                        placeholder="Your current password"
                        type="password"
                        name="currentPassword"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values?.currentPassword}
                        error={errors?.currentPassword}
                      />
                      <Input
                        label="New Password"
                        placeholder="Your new password"
                        type="password"
                        name="newPassword"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values?.newPassword}
                        error={errors?.newPassword}
                      />
                      <div>
                        <Button type="submit" variant="outline" text="Save" size="sm" loading={isSubmitting} />
                      </div>
                    </form>
                  )}
                </Formik>
                <button type="button" className="absolute right-5 top-3" onClick={() => onClose && onClose()}>
                  <MdClose width={24} />
                </button>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
