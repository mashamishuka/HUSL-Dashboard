import clsx from 'clsx'
import { Fragment } from 'react'

import Button, { Variants } from '@components/Button'
import { Menu, Transition } from '@headlessui/react'

interface BlankDropdownProps {
  text?: JSX.Element | string
  buttonClass?: string
  buttonVariant?: Variants
  dropdownClass?: string
  containerClass?: string
}

export const BlankDropdown: React.FC<BlankDropdownProps> = ({
  text,
  buttonClass,
  buttonVariant = 'outline',
  children,
  dropdownClass,
  containerClass
}) => {
  return (
    <Menu as="div" className={clsx('flex items-center relative', containerClass)}>
      <Menu.Button as="div">
        {typeof text !== 'string' ? (
          <Button
            variant={buttonVariant}
            className={clsx('flex items-center space-x-2 border-white border-opacity-50 rounded-xl', buttonClass)}>
            {text}
          </Button>
        ) : (
          text
        )}
      </Menu.Button>

      {/* Use the Transition component. */}
      <Transition
        as={Fragment}
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0">
        <Menu.Items
          className={clsx(
            dropdownClass,
            'absolute right-0 flex flex-col justify-start py-1 overflow-auto text-base text-left bg-dark rounded-lg shadow-frame border border-white border-opacity-50 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-30 top-12 divide-y divide-white divide-opacity-50 mt-3'
          )}>
          <Menu.Item as="div">{children}</Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
