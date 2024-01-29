import { Fragment } from 'react'

import { Dialog, Transition } from '@headlessui/react'
import { MdClose } from 'react-icons/md'
import { SingleSelect } from '@components/Forms/components'
import Button from '@components/Button'
import { Formik } from 'formik'
import { createFbAdsConfig } from '@src/restapi/fbads/mutation'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import { mutate } from 'swr'
import { GET_CONFIG, IS_FBADS_TOKEN_VALID } from '@src/restapi/fbads/constants'
import { useSession } from 'next-auth/react'
import { FbAdsConfigDto } from '@src/restapi/fbads/fbads'

interface DefaultModal {
  show: boolean
  // onShow?: boolean
  onClose?: () => void
  width?: string
  data?: any
}

export const ChooseAdAccount: React.FC<DefaultModal> = ({ show, onClose, width = '32rem', data }) => {
  const { query, push } = useRouter()
  const { data: session } = useSession()

  const handlePickAdAccount = async (values: Record<string, any>) => {
    if (!data?.accessToken || data?.accessToken === '') {
      toast.error('Access token is required.')
      return
    }
    try {
      const body: FbAdsConfigDto = {
        adAccountId: values?.adAccountId,
        token: data?.accessToken
      }
      if (session?.user?.role === 'admin' && query?.userId) {
        body.user = query?.userId?.toString()
      }
      const fbAdsConfig = await createFbAdsConfig(body)
      toast.success(fbAdsConfig?.message || 'FB Ads config saved successfully!')
      // mutate or update the cache
      if (session?.user?.role === 'admin' && query?.userId) {
        mutate?.(GET_CONFIG + '/' + query?.userId)
      } else {
        mutate?.(GET_CONFIG)
      }
      mutate?.(IS_FBADS_TOKEN_VALID)
      // push to remove the access token from the url
      push(data?.ref || '/settings/facebook')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Something went wrong. Please try again later.')
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
                    adAccountId: ''
                  }}
                  onSubmit={handlePickAdAccount}>
                  {({ handleSubmit, setFieldValue }) => (
                    <form onSubmit={handleSubmit} className="flex flex-col space-y-10">
                      <span>Choose Ad Account</span>
                      <div>
                        <SingleSelect
                          label="Available Ad Account"
                          items={data?.adAccounts?.map((adAccount: any) => ({
                            label: adAccount.account_id,
                            value: adAccount.id
                          }))}
                          name="adAccountId"
                          setFieldValue={setFieldValue}
                          hideSearch
                        />
                      </div>
                      <div>
                        <Button type="submit" variant="outline" text="Save" size="sm" />
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
