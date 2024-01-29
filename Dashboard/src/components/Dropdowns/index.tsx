import clsx from 'clsx'
import { Fragment } from 'react'
import { MdArrowDropDown } from 'react-icons/md'

import Button, { Variants } from '@components/Button'
import { Menu, Transition } from '@headlessui/react'

interface DropdownProps {
  text?: JSX.Element | string
  items?:
    | string[]
    | {
        label?: JSX.Element | string
        hide?: boolean
        onClick?: () => void
      }[]
  buttonClass?: string
  buttonVariant?: Variants
  dropdownClass?: string
  containerClass?: string
  itemClass?: string
}

export const Dropdown: React.FC<DropdownProps> = ({
  text,
  buttonClass,
  buttonVariant = 'outline',
  items,
  dropdownClass,
  containerClass,
  itemClass
}) => {
  return (
    <Menu as="div" className={clsx('flex items-center relative', containerClass)}>
      <Menu.Button as="div">
        {typeof text === 'string' ? (
          <Button
            variant={buttonVariant}
            className={clsx('flex items-center space-x-2 border-white border-opacity-50 rounded-xl', buttonClass)}>
            <span>{text}</span>
            <MdArrowDropDown className="text-xl text-primary" />
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
            'absolute right-0 flex flex-col justify-start py-1 overflow-auto text-base text-left bg-dark rounded-lg shadow-frame max-h-60 border border-white border-opacity-50 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-30 top-12 divide-y divide-white divide-opacity-50 mt-3'
          )}>
          {items?.map((item, i) => (
            <Menu.Item key={i} as={Fragment}>
              {typeof item === 'string' ? (
                <button className={clsx('flex items-center px-5 py-2 space-x-2 transition-all hover:bg-light', itemClass)}>
                  {item}
                </button>
              ) : (
                <>
                  {item?.hide ? (
                    <></>
                  ) : (
                    <button
                      onClick={item?.onClick}
                      className={clsx('flex items-center px-5 py-2 space-x-2 transition-all hover:bg-secondary', itemClass)}>
                      {item?.label}
                    </button>
                  )}
                </>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
