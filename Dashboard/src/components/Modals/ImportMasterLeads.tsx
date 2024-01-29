import { Fragment, useState } from 'react'

import { Dialog, Transition } from '@headlessui/react'
import { MdClose, MdDownload } from 'react-icons/md'
import { BaseDropzone } from '@components/Forms/components/BaseDropzone'
import { excelToJson } from '@utils/lib/excelToJson'
import { toast } from 'react-toastify'
import Button from '@components/Button'

interface DefaultModal {
  show: boolean
  // onShow?: boolean
  onClose?: () => void
  width?: string
}
type Leads = {
  name?: string
  email?: string
  phone?: string
  niche?: string
}
export const ImportMasterLeads: React.FC<DefaultModal> = ({ show, onClose, width = '42rem' }) => {
  const [fileKey, setFileKey] = useState(0)
  const [leads, setLeads] = useState<Leads[]>()
  const [resultCount, setResultCount] = useState<{
    total: number
    success: number
    failed: number
  }>({
    total: 0,
    success: 0,
    failed: 0
  })

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
    const cols = ['name', 'email', 'phone', 'niche']
    // check if all columns are present
    const isColsPresent = cols.some((col) => Object.prototype.hasOwnProperty.call(fileJson[0], col))
    if (!isColsPresent) {
      toast.error('Columns incorrect, please try another file. Columns should has name, email, phone, and niche.')
      return
    }
    // map json
    let mapJson = fileJson.map((item) => {
      const obj: any = {}
      cols.forEach((col) => {
        obj[col] = item[col]
      })
      // if there is no niche field in the excel, return fail
      if (!item.niche) {
        return null
      }
      return obj
    })
    // count total, success, and failed
    const total = mapJson.length
    const success = mapJson.filter((item) => item).length
    const failed = total - success
    if (failed === total) {
      toast.error('No leads to import, please try another file.')
      setFileKey(fileKey + 1)
      return
    }
    setResultCount({
      total,
      success,
      failed
    })
    mapJson = mapJson.filter((item) => item)
    setLeads(mapJson)
  }

  const handleAddLeads = async () => {
    console.log('clicked')
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
                <span className="text-xl font-semibold">Import Leads</span>
                <div className="flex flex-col mt-5 space-y-5">
                  <BaseDropzone
                    key={fileKey}
                    label="Choose File"
                    accept={{
                      'application/vnd.ms-excel': ['.xls', '.xlsx', '.csv']
                    }}
                    multiple={false}
                    onDrop={handleChooseFile}
                    compact
                    hint={
                      <span>
                        Only .xls, .xlsx, .csv files are allowed with column <b>name, email, phone, niche.</b>
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
                              <th className="w-48 py-2 md:w-auto">Niche</th>
                              <th className="w-10 text-center">&nbsp;</th>
                            </tr>
                          </thead>
                          <tbody>
                            {leads?.map((lead, index) => (
                              <tr key={index}>
                                <td className="py-2 pl-3 pr-5 md:pr-0">{lead.name}</td>
                                <td className="py-2 whitespace-nowrap">{lead.email}</td>
                                <td className="py-2">{lead.phone}</td>
                                <td className="py-2">{lead.niche}</td>
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
                      <div className="mt-2 mb-3 text-xs">
                        <span className="font-bold">{resultCount?.total} records</span> found.{' '}
                        <span className="font-bold text-primary">{resultCount?.success} success</span>
                        {resultCount?.failed > 0 && (
                          <span>
                            , <span className="font-bold text-danger">{resultCount?.failed} failed</span>
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <Button onClick={handleAddLeads} className="flex items-center space-x-2" disabled={!leads?.length}>
                      <MdDownload />
                      <span>Import</span>
                    </Button>
                  </div>
                </div>
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
