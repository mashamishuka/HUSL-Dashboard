import { useActiveBusiness } from '@hooks/useActiveBusiness'
import { Loading } from '@components/Icons'
import { WarningAlert } from '@components/Alerts'
import { Disclosure } from '@headlessui/react'
import { ChevronRightIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { getTagCopies, replaceBulk } from '@utils/index'
import { useBusiness } from '@hooks/useBusiness'
import { useSetting } from '@hooks/useSetting'

export const NicheScriptList: React.FC = () => {
  const { business: activeBusiness } = useActiveBusiness()
  const { value: scripts, error } = useSetting('niche-script')

  const { data } = useBusiness(activeBusiness?._id)
  const { copyFrom, copyTo } = getTagCopies(data?.data)

  if (!scripts && !error)
    return (
      <div className="flex items-center justify-center pt-5 pb-10">
        <Loading />
      </div>
    )
  return (
    <div className="flex flex-col space-y-3">
      {scripts?.length == 0 && <WarningAlert>No scripts found.</WarningAlert>}
      {scripts?.map((script: any, i: number) => (
        <Disclosure key={i} as="div" className="px-5 py-4 rounded-md bg-dark">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex items-center justify-between w-full">
                <span>{replaceBulk(script.title, copyFrom, copyTo)}</span>
                <ChevronRightIcon className={clsx('w-6 h-6', open ? 'rotate-90 transform' : '')} />
              </Disclosure.Button>
              <Disclosure.Panel className="mt-5">
                <span
                  className="prose prose-invert"
                  dangerouslySetInnerHTML={{ __html: replaceBulk(script.content, copyFrom, copyTo) || '' }}></span>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      ))}
    </div>
  )
}
