import { Fragment } from 'react'

import { Dialog, Transition } from '@headlessui/react'
import { MdClose } from 'react-icons/md'
import Button from '@components/Button'
import { Formik } from 'formik'
import { toast } from 'react-toastify'
import { Input } from '@components/Forms/components/Input'
import { editUser } from '@src/restapi/users/mutation'
import { useMe } from '@hooks/useMe'

interface DefaultModal {
  show: boolean
  // onShow?: boolean
  onClose?: () => void
  width?: string
}

export const AddDiscordUsername: React.FC<DefaultModal> = ({ show, onClose, width = '32rem' }) => {
  const { me } = useMe()

  const handleAddDiscordUsername = async (values: Record<string, any>) => {
    if (!me?._id) {
      toast.error('You need to login first')
      return
    }
    try {
      await editUser(me?._id, {
        discordUsername: values.discordUsername
      })
      window.location.reload()
    } catch (error: any) {
      toast.error(error?.message || 'Something went wrong, please try again later.')
    }
    onClose?.()
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
                    discordUsername: me?.discordUsername || ''
                  }}
                  onSubmit={handleAddDiscordUsername}
                  enableReinitialize>
                  {({ handleSubmit, handleBlur, handleChange, values, isSubmitting }) => (
                    <form onSubmit={handleSubmit} className="flex flex-col mt-5 space-y-5">
                      <Input
                        label="Discord Username"
                        placeholder="Enter your discord username"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        name="discordUsername"
                        value={values?.discordUsername}
                        hint="You can change it later in settings."
                        required
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
