import clsx from 'clsx'
import useSWR from 'swr'

import { Disclosure, Transition } from '@headlessui/react'
import { GET_USER_TIPS_N_TRICK } from '@src/restapi/tipsntricks/constants'
import { TipsNTrick } from '@src/restapi/tipsntricks/tipsntricks'

export const TipsAndTrick: React.FC = () => {
  const { data } = useSWR<RestApi.Response<TipsNTrick>>(GET_USER_TIPS_N_TRICK)

  return (
    <>
      {data?.data?.tipsNtricks?.map((item, i) => (
        <Disclosure key={i}>
          {({ open }) => (
            <div className={clsx('transition-all', open ? 'bg-dark p-3 rounded-lg' : '')}>
              <Disclosure.Button className={clsx('text-left', open ? 'font-bold' : 'font-light')}>
                {item?.title}
              </Disclosure.Button>

              <Transition
                show={open}
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0">
                <Disclosure.Panel as="ul" className="mt-2 ml-3 text-sm font-light" static>
                  {item?.description?.split('\n')?.map((desc, index) => (
                    <li key={index}>{desc}</li>
                  ))}
                </Disclosure.Panel>
              </Transition>
            </div>
          )}
        </Disclosure>
      ))}
    </>
  )
}
