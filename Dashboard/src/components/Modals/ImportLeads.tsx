import { Fragment, useEffect, useMemo, useState } from 'react'

import { Dialog, Transition } from '@headlessui/react'
import { MdClose, MdDownload } from 'react-icons/md'
import { BaseDropzone } from '@components/Forms/components/BaseDropzone'
import { excelToJson } from '@utils/lib/excelToJson'
import { toast } from 'react-toastify'
import Button from '@components/Button'
import { ErrorAlert, WarningAlert } from '@components/Alerts'
import { Business } from '@src/restapi/businesses/business'
import { importLeads } from '@src/restapi/niche/mutation'
import { useRouter } from 'next/router'
import { useGetActiveSubscriptions } from '@hooks/usePurchases'
import { Loading } from '@components/Icons'

interface DefaultModal {
  show: boolean
  // onShow?: boolean
  onClose?: () => void
  width?: string
  businesses?: Business[]
  businessCount?: number
  mutate?: () => void
}
type Leads = {
  name?: string
  email?: string
  phone?: string
}
export const ImportLeads: React.FC<DefaultModal> = ({
  show,
  onClose,
  width = '42rem',
  businessCount: initialBusinessesCount = 0,
  businesses: initialBusinesses,
  mutate
}) => {
  const { query } = useRouter()
  const [leads, setLeads] = useState<Leads[]>()
  const [submitDisabled, setSubmitDisabled] = useState(true)
  const [importing, setImporting] = useState(false)
  const active_subscriptions = useGetActiveSubscriptions('price_1MFPAGCOIb8tHxq5WuDeEww9')
  const subscribed_users: string[] | undefined = active_subscriptions?.data?.data?.map(({ user }) => user)

  const businesses = useMemo(() => {
    if (!initialBusinesses) return []
    return initialBusinesses.filter(({ user }) => user?._id && subscribed_users?.includes(user?._id?.toString()))
  }, [initialBusinesses, subscribed_users, active_subscriptions])

  const businessCount = useMemo(() => {
    if (!businesses) return 0
    return businesses.length
  }, [initialBusinessesCount, businesses])

  // remove leads by index
  const handleRemoveLead = (index: number) => {
    if (!leads) return
    const newLeads = [...leads]
    newLeads.splice(index, 1)
    setLeads(newLeads)
  }

  const handleChooseFile = async (files: File[]) => {
    const file = files?.[0]
    if (!file) {
      setLeads([])
      return
    }
    const fileJson = await excelToJson(file)
      .then((data) => data)
      .catch(() => null)
    if (!fileJson) {
      setLeads([])
      toast.error('Something went importing file, please try again.')
      return
    }
    // get only these columns
    const cols = ['name', 'email', 'phone']
    const fileCols = Object.keys(fileJson[0])?.map((v) => v.toLowerCase())

    // check if all columns are present
    const isColsPresent = cols.every((col) => fileCols.includes(col))
    if (!isColsPresent) {
      toast.error('Columns incorrect, please try another file. Columns should has name, email, phone, and website.')
      return
    }
    // map json
    let mapJson = fileJson.map((item) => {
      const obj: any = {}
      cols.forEach((col) => {
        obj[col] = item[col]
      })
      return obj
    })
    // remove duplicate email
    mapJson = mapJson.filter((item, index, self) => {
      return self.findIndex((t) => t.email === item.email) === index
    })
    setLeads(mapJson)
  }

  const handleAddLeads = async () => {
    const nicheId = query?.id?.toString()
    if (!nicheId) return
    setImporting(true)
    setSubmitDisabled(true)
    // get businesses
    const businessIds = businesses?.map((business) => business._id)
    // get leads
    const leadsData = leads?.map((lead, index) => {
      // handle shared leads, make sure all business has leads
      const businessIndex = index % businessCount
      const businessId = businessIds?.[businessIndex]
      return {
        ...lead,
        business: businessId
      }
    })
    // remove remaining leads if its more than businessCount
    // if (leadsData && leadsData?.length > businessCount) {
    //   leadsData?.splice(businessCount, leadsData.length - businessCount)
    // }
    // add remaining leads if its more than businessCount to last business
    if (leadsData && leadsData?.length > businessCount) {
      const lastBusinessId = businessIds?.[businessCount - 1]
      const remainingLeads = leadsData?.splice(businessCount, leadsData.length - businessCount)
      remainingLeads?.forEach((lead) => {
        leadsData?.push({
          ...lead,
          business: lastBusinessId
        })
      })
    }

    try {
      await importLeads(nicheId, leadsData).then((data) => {
        toast.success(data?.message || 'Leads imported successfully.')
      })
      onClose?.()
      mutate?.()
      // mutate?.(`${GET_LEADS}?nicheId=${query?.id?.toString()}`)
    } catch (error: any) {
      toast.error(error?.response?.message || 'Something went wrong, please try again.')
    }
    setImporting(false)
    setSubmitDisabled(false)
  }

  useEffect(() => {
    // check if leads is gte with businessCount
    if (leads && leads?.length >= businessCount) {
      setSubmitDisabled(false)
    } else {
      setSubmitDisabled(true)
    }
  }, [leads])

  console.log(active_subscriptions)
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
                <span className="block mb-5 text-xl font-semibold">Import Leads</span>
                {active_subscriptions?.isLoading && (
                  <div className="flex justify-center my-5">
                    <Loading />
                  </div>
                )}

                {!active_subscriptions?.isLoading && (
                  <>
                    {businessCount === 0 && <WarningAlert noHide>This niche has no business.</WarningAlert>}
                    {businessCount > 0 && (
                      <div className="flex flex-col space-y-5">
                        <BaseDropzone
                          label="Choose File"
                          accept={{
                            'application/vnd.ms-excel': ['.xls', '.xlsx', '.csv']
                          }}
                          multiple={false}
                          onDrop={handleChooseFile}
                          compact
                          hint={
                            <span>
                              Only .xls, .xlsx, .csv files are allowed with column <b>name, email, phone</b>
                            </span>
                          }
                        />
                        {leads && leads?.length > 0 && (
                          <div>
                            <span className="block mb-1 text-sm">Data Preview</span>
                            <div className="overflow-y-auto max-h-80">
                              <table className="w-full text-left border border-gray-500 table-fixed md:table-auto">
                                <thead>
                                  <tr className="border-b border-gray-500">
                                    <th className="w-56 py-2 pl-3 pr-5 md:w-auto md:pr-0">Name</th>
                                    <th className="py-2 whitespace-nowrap w-72 md:w-auto">Email</th>
                                    <th className="w-48 py-2 md:w-auto">Phone</th>
                                    <th className="w-10 text-center">&nbsp;</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {leads?.map((lead, index) => (
                                    <tr key={index}>
                                      <td className="py-2 pl-3 pr-5 md:pr-0">{lead.name}</td>
                                      <td className="py-2 whitespace-nowrap">{lead.email}</td>
                                      <td className="py-2">{lead.phone}</td>
                                      <td className="flex items-center justify-center py-3 space-x-2">
                                        <button className="text-red-500" onClick={() => handleRemoveLead(index)}>
                                          <MdClose width={24} className="text-xl" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <div className="mb-3 text-xs">
                              <span className="font-bold">{leads.length} records</span> found.
                            </div>
                            {
                              // check if leads is gte with businessCount
                              leads.length >= businessCount ? (
                                <WarningAlert>
                                  <span className="font-bold">{businessCount} subscribed businesses</span> found using this
                                  niche. <span className="font-bold">{Math.floor(leads.length / businessCount)} leads</span>{' '}
                                  will be shared evenly to each business.
                                  <br />
                                  {leads.length % businessCount > 0 && (
                                    <span className="text-warning">
                                      {leads.length % businessCount} leads will be given to{' '}
                                      {businesses?.[businessCount - 1].name} as last business on this niche.
                                    </span>
                                  )}
                                </WarningAlert>
                              ) : (
                                <ErrorAlert>
                                  <span className="font-bold">{businessCount} Business</span> found using this niche.{' '}
                                  <span className="font-bold">Requires at least {businessCount} leads to import.</span>
                                </ErrorAlert>
                              )
                            }
                          </div>
                        )}

                        <div>
                          <Button
                            onClick={handleAddLeads}
                            className="flex items-center space-x-2"
                            disabled={submitDisabled}
                            loading={importing}>
                            <MdDownload />
                            <span>Import</span>
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}

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
