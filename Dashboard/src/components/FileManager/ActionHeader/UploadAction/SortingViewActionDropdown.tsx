import { Alphabet, PreviewList } from '@components/Icons'
import { Menu, Transition } from '@headlessui/react'
import { FiCalendar, FiGrid } from 'react-icons/fi'
import { useFileManagerView } from '@hooks/useFileManagerView'

export const SortingViewActionDropdown: React.FC = () => {
  const { viewType, toggleViewType } = useFileManagerView()

  return (
    <Menu as="div" className="relative z-20 flex items-center">
      {({ open }) => (
        <>
          <Menu.Button className="inline-flex items-center justify-center text-lg rounded-lg cursor-pointer group h-[42px] w-[42px] hover:bg-secondary hover:text-primary">
            <PreviewList />
          </Menu.Button>

          {/* Use the `Transition` component. */}
          <Transition
            show={open}
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0">
            <Menu.Items
              static
              className="absolute right-0 z-30 flex flex-col justify-start w-56 py-1 overflow-auto text-base text-left rounded-lg bg-secondary shadow-frame max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm top-12 divide-opacity-50">
              <Menu.Item as="span" className="px-5 pt-3 pb-1 text-sm">
                <span className="text-primary">View</span>
              </Menu.Item>
              <Menu.Item
                as="button"
                className="flex items-center px-5 py-3 space-x-3 text-gray-300 capitalize hover:bg-dark hover:text-primary"
                onClick={toggleViewType}>
                <FiGrid className="text-lg" />
                <span>{viewType === 'grid' ? 'List' : 'Grid'} View</span>
              </Menu.Item>
              <Menu.Item as="span" className="px-5 pt-3 pb-1 text-sm">
                <span className="text-primary">Sorting</span>
              </Menu.Item>
              <Menu.Item
                as="button"
                className="flex items-center px-5 py-3 space-x-3 text-gray-300 hover:bg-dark hover:text-primary">
                <FiCalendar className="text-lg" />
                <span>Sort by Date</span>
              </Menu.Item>
              <Menu.Item
                as="button"
                className="flex items-center px-5 py-3 space-x-3 text-gray-300 hover:bg-dark hover:text-primary">
                <Alphabet />
                <span>Sort by Alphabet</span>
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  )
}
