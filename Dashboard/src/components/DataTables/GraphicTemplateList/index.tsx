import { useMemo, Fragment, useState } from 'react'
import useSWR from 'swr'
import { GET_TEMPLATE } from '@src/restapi/graphicTemplates/constants'
import clsx from 'clsx'
import Image from 'next/image'
import { ImFileEmpty } from 'react-icons/im'
import { IoColorWandOutline } from 'react-icons/io5'
import moment from 'moment'
import { MdDelete, MdEdit, MdMoreHoriz } from 'react-icons/md'
import { Popover } from '@headlessui/react'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { deleteTemplate } from '@src/restapi/graphicTemplates/mutations'
import { confirm } from '@components/ConfirmationBox'
import { TemplateMetaModal } from '@components/Modals'

export const GraphicTemplateListTable: React.FC = () => {
  const [manageTemplateModal, setManageTemplateModal] = useState<{
    state: boolean
    data?: any
  }>({
    state: false,
    data: null
  })
  const { data: templates, mutate } = useSWR<RestApi.Response<GraphicTemplate[]>>(GET_TEMPLATE)

  const data = useMemo(() => {
    if (!templates) return []
    return templates?.data
  }, [templates])

  const handleDeleteTemplate = async (templateId: string) => {
    const confirmation = await confirm('Are you sure you want to delete this template?')
    if (!confirmation) return
    try {
      await deleteTemplate(templateId)
      toast.success('Template deleted successfully.')
      mutate?.()
    } catch (_) {
      toast.error('Something went wrong, please try again later.')
    }
  }
  return (
    <div className={clsx('grid gap-5 grid-cols-3')}>
      {data?.map((template, i) => (
        <div key={i} className="relative w-full p-2 rounded-lg bg-dark">
          <div className="relative w-full h-32 overflow-hidden rounded-lg">
            {template?.preview?.url && (
              <>
                <div
                  className="rounded-lg"
                  style={{
                    backgroundImage: `url(${template?.preview?.url})`,
                    height: '100%',
                    width: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(40px)'
                  }}></div>
                <div className="flex items-center justify-center w-full h-full">
                  <Image
                    src={template?.preview?.url}
                    layout="fixed"
                    objectFit="contain"
                    width={100}
                    height={100}
                    className="z-10 "
                  />
                </div>
              </>
            )}
          </div>
          <div className="relative flex items-center justify-between px-2 py-3 text-sm">
            <div className="flex flex-col space-y-1">
              <h3 className="font-medium">
                {template.name} · {template.createdBy?.name}
              </h3>
              <span className="flex items-center space-x-2 text-xs font-light text-white text-opacity-50">
                <ImFileEmpty />
                <span>Created {moment(template?.createdAt).fromNow()}</span>
              </span>
            </div>
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
                  <path d="M16 12.5V16h-3.5l1.75-1.75L16 12.5z" fill="currentColor" fillOpacity="0.9"></path>
                </svg>
              </Popover.Button>

              <Popover.Panel className="absolute right-0 z-10 w-40 p-3 border border-gray-800 rounded-lg top-12 bg-secondary">
                <div className="flex flex-col text-xs">
                  <Link href={`/admin/generator/graphics/editor?templateId=${template?._id}`}>
                    <a className="flex items-center px-2 py-1 space-x-2 rounded-md hover:bg-dark hover:bg-opacity-50 ">
                      <IoColorWandOutline />
                      <span>Open Design</span>
                    </a>
                  </Link>
                  <hr className="border-gray-700 my-1.5" />
                  <button
                    onClick={() =>
                      setManageTemplateModal({
                        state: true,
                        data: template
                      })
                    }
                    className="flex items-center px-2 py-1 space-x-2 rounded-md hover:bg-dark hover:bg-opacity-50">
                    <MdEdit />
                    <span>Edit Info</span>
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template?._id)}
                    className="flex items-center px-2 py-1 space-x-2 rounded-md hover:bg-dark hover:bg-opacity-50">
                    <MdDelete />
                    <span>Delete</span>
                  </button>
                </div>
              </Popover.Panel>
            </Popover>
          </div>
        </div>
      ))}
      <TemplateMetaModal
        show={manageTemplateModal.state}
        onClose={() => {
          mutate?.()
          setManageTemplateModal({
            ...manageTemplateModal,
            state: false
          })
        }}
        data={manageTemplateModal?.data}
      />
    </div>
  )
}
