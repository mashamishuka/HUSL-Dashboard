import { WarningAlert } from '@components/Alerts'
import { confirm } from '@components/ConfirmationBox'
import { Loading } from '@components/Icons'
import { Disclosure } from '@headlessui/react'
import { ChevronRightIcon } from '@heroicons/react/20/solid'
import { useSetting } from '@hooks/useSetting'
import { updateSetting } from '@src/restapi/setting/mutation'
import clsx from 'clsx'
import { MdDelete } from 'react-icons/md'
import { toast } from 'react-toastify'
import { mutate } from 'swr'

export const ScriptList = () => {
  const { value: scripts, error } = useSetting('niche-script')

  const handleDeleteScript = async (scriptTitle: string) => {
    try {
      const confirmation = await confirm('Are you sure you want to delete this script?')
      if (!confirmation) return
      // remove an array element by id
      const newScripts = scripts?.filter((script: any) => script.title !== scriptTitle)
      await updateSetting('niche-script', {
        value: newScripts
      })

      toast.success('Script deleted successfully.')
      mutate?.('/settings')
    } catch (error: any) {
      toast.error(error?.response?.message || 'Something went wrong, please try again later.')
    }
  }

  if (typeof scripts == undefined && !error)
    return (
      <div className="flex items-center justify-center pt-5 pb-10">
        <Loading />
      </div>
    )
  return (
    <div className="flex flex-col space-y-3">
      {scripts?.length == 0 && <WarningAlert>No scripts found.</WarningAlert>}
      {scripts?.map((script: any, i: number) => (
        <Disclosure key={i} as="div" className="px-5 py-3 rounded-md bg-dark">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex items-center justify-between w-full">
                <span>{script.title}</span>
                <div className="flex items-center space-x-3">
                  <button onClick={() => handleDeleteScript(script?.title)}>
                    <MdDelete className="w-4 h-4 text-danger" />
                  </button>
                  <ChevronRightIcon className={clsx('w-6 h-6', open ? 'rotate-90 transform' : '')} />
                </div>
              </Disclosure.Button>
              <Disclosure.Panel className="mt-3">
                <div className="prose prose-invert" dangerouslySetInnerHTML={{ __html: script.content || '' }}></div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      ))}
    </div>
  )
}
