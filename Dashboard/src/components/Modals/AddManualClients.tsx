import { Fragment } from 'react'

import { Dialog, Popover, Transition } from '@headlessui/react'
import { MdAdd, MdClose, MdDelete, MdMoreHoriz } from 'react-icons/md'
import Button from '@components/Button'
import { Formik } from 'formik'
import { toast } from 'react-toastify'
import { Input } from '@components/Forms/components/Input'
import { usePurchasesByUser } from '@hooks/usePurchases'
import { createDirectPurchase, deleteDirectPurchase } from '@src/restapi/purchases/mutation'
import { Purchase } from '@src/restapi/purchases/purchase'
import { confirm } from '@components/ConfirmationBox'
interface DefaultModal {
  show: boolean
  // onShow?: boolean
  onClose?: () => void
  width?: string
  data?: any
  mutate?: any
}

export const AddManualClientsModal: React.FC<DefaultModal> = ({ show, onClose, width = '32rem', data, mutate }) => {
  const { data: purchases, mutate: orderMutate } = usePurchasesByUser(data?.id)

  const handleAddDirectOrder = async (values: Record<string, any>) => {
    try {
      await createDirectPurchase(data?.id, 'direct', values?.notes, {
        quantity: values?.order,
        repetition: 'once'
      })
      toast.success('Direct order added successfully.')
      orderMutate?.()
      setTimeout(() => {
        mutate?.()
      }, 500)
    } catch (error: any) {
      toast.error(error?.message || 'Something went wrong, please try again later.')
    }
    onClose?.()
    return
  }

  const handleDeleteDirectOrder = async (data?: Purchase) => {
    if (data?.name !== 'direct') return
    const confirmation = await confirm('Are you sure you want to delete this order?')
    if (!confirmation) return
    try {
      await deleteDirectPurchase(data?._id)
      toast.success('Direct order deleted successfully.')
      orderMutate?.()
      mutate?.()
    } catch (error: any) {
      toast.error(error?.message || 'Something went wrong, please try again later.')
    }
    return
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
                <div>
                  <h3 className="text-lg font-semibold text-white">Orders</h3>
                  <table className="w-full my-3">
                    <thead>
                      <tr>
                        <th className="text-sm font-semibold text-left text-gray-300">Type</th>
                        <th className="text-sm font-semibold text-left text-gray-300">Orders</th>
                        <th className="text-sm font-semibold text-left text-gray-300">Notes</th>
                        <th className="text-sm font-semibold text-left text-gray-300">&nbsp;</th>
                      </tr>
                    </thead>
                    <tbody className="overflow-y-auto text-sm divide-y divide-gray-600 max-h-60">
                      {purchases?.data?.map((v) => (
                        <tr key={v?._id}>
                          <td>{v?.name}</td>
                          <td>{v?.customers || v?.data?.quantity || 0}</td>
                          <td className="relative">
                            {v?.note ? (
                              <Popover as={Fragment}>
                                <Popover.Button className="relative p-1 text-lg rounded bg-secondary hover:bg-gray-800">
                                  <MdMoreHoriz />
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                    className="absolute right-1 bottom-1">
                                    <path
                                      d="M16 12.5V16h-3.5l1.75-1.75L16 12.5z"
                                      fill="currentColor"
                                      fillOpacity="0.9"></path>
                                  </svg>
                                </Popover.Button>

                                <Popover.Panel className="absolute right-0 z-10 w-40 p-2 text-sm border border-gray-800 rounded-lg top-5 bg-secondary">
                                  {v?.note}
                                </Popover.Panel>
                              </Popover>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="flex items-center space-x-1">
                            {v?.name === 'direct' && (
                              <>
                                <button className="text-danger" onClick={() => handleDeleteDirectOrder(v)}>
                                  <MdDelete />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <hr className="block mt-5 border-gray-500" />
                <Formik
                  initialValues={{
                    notes: '',
                    order: ''
                  }}
                  onSubmit={handleAddDirectOrder}
                  enableReinitialize>
                  {({ handleSubmit, handleBlur, handleChange, values, isSubmitting }) => (
                    <form onSubmit={handleSubmit} className="flex flex-col mt-5 space-y-3">
                      <Input
                        label="Notes"
                        placeholder="Enter your notes"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        name="notes"
                        value={values?.notes}
                        required
                      />
                      <Input
                        type="number"
                        label="Order"
                        placeholder="Enter your order"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        name="order"
                        value={values?.order}
                        required
                      />
                      <div>
                        <Button
                          type="submit"
                          variant="outline"
                          className="flex items-center space-x-1"
                          size="sm"
                          loading={isSubmitting}>
                          <MdAdd />
                          <span>Add Manual</span>
                        </Button>
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
