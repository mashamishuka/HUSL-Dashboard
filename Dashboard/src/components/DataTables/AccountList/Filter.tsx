import { Menu, Transition } from '@headlessui/react'
import { MdOutlineKeyboardArrowDown } from 'react-icons/md'
import { useState } from 'react'

interface AccountListFilterProps {
  onFilter?: (params?: Record<string, any>) => void
  initialParams?: Record<string, any>
}
export const AccountListFilter: React.FC<AccountListFilterProps> = ({ initialParams, onFilter }) => {
  const [open, setOpen] = useState(false)
  return (
    <Menu>
      <Menu.Button
        onClick={() => setOpen(!open)}
        className="flex items-center px-3 py-2 space-x-2 text-sm border rounded-lg border-primary text-primary">
        <span>Filter</span>
        <MdOutlineKeyboardArrowDown />
      </Menu.Button>

      {/* Use the `Transition` component. */}
      <Transition
        show={open}
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
        className="relative z-30">
        <Menu.Items className="absolute right-0 z-50 w-56 border border-gray-600 divide-y rounded-md shadow-lg top-2 bg-dark divide-secondary focus:outline-none">
          <div className="flex flex-col px-3 py-4 space-y-3 text-sm">
            <Menu.Item>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded"
                  defaultChecked={initialParams?.isSubscribed}
                  onChange={(evt) =>
                    onFilter?.({
                      isSubscribed: evt.target.checked
                    })
                  }
                />
                <span>Subscribed companies</span>
              </label>
            </Menu.Item>
            <Menu.Item>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded"
                  defaultChecked={initialParams?.hasCustomer}
                  onChange={(evt) =>
                    onFilter?.({
                      hasCustomer: evt.target.checked
                    })
                  }
                />
                <span>Companies with customers</span>
              </label>
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
