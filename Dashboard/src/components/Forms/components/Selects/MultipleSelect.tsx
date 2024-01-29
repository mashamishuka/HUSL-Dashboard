import { Fragment, useMemo, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { MdArrowDropDown, MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md'
import clsx from 'clsx'

const people = [
  { name: 'Wade Cooper' },
  { name: 'Arlene Mccoy' },
  { name: 'Devon Webb' },
  { name: 'Tom Cook' },
  { name: 'Tanya Fox' },
  { name: 'Hellen Schmidt' }
]

interface MultipleSelectProps {
  className?: string
  label?: string
  hint?: string
  variant?: 'default' | 'error' | 'success'
  append?: React.ReactNode | string
  required?: boolean
  hideSearch?: boolean
  placeholder?: string
}

export const MultipleSelect: React.FC<MultipleSelectProps> = ({
  hint,
  variant,
  label,
  className,
  hideSearch,
  required,
  placeholder
}) => {
  const [selected, setSelected] = useState([people[0]])

  const [items, setItems] = useState(people)
  const [searchKeyword, setSearchKeyword] = useState('')

  const searchItem = (search?: string) => {
    setSearchKeyword(search || '')
    if (!search) {
      setItems(people)
      return
    }
    const newItems = people.filter((item) => item.name.toLowerCase().includes(search?.toLowerCase()))
    setItems(newItems)
  }

  const selectedItem = useMemo(() => {
    if (selected?.length > 5) {
      return `${selected.length} selected`
    } else if (selected?.length === 0) {
      return placeholder || 'Select items'
    } else {
      return selected?.map((v) => v.name)?.join(', ')
    }
  }, [selected])

  const theme = useMemo(() => {
    let className = {
      labelColor: 'text-dark',
      hintColor: 'text-hint',
      borderColor: 'border-outline'
    }
    switch (variant) {
      case 'error':
        className = {
          labelColor: 'text-danger',
          hintColor: 'text-danger',
          borderColor: 'border-danger'
        }
        break
      case 'success':
        className = {
          labelColor: 'text-success',
          hintColor: 'text-success',
          borderColor: 'border-success'
        }
        break
      default:
        break
    }
    return className
  }, [variant])

  return (
    <div>
      {label && (
        <label className={clsx('text-xs mb-px', theme.labelColor)}>
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <Listbox value={selected} onChange={setSelected} multiple>
        {/* TODO: add hidden input */}
        <div className="relative z-10 mt-1">
          <Listbox.Button
            className={clsx(
              'px-3 py-2 rounded-md bg-transparent focus:outline-none border w-full font-light text-left',
              `placeholder:${theme.hintColor}`,
              theme.borderColor,
              className
            )}>
            <span className="block truncate">{selectedItem}</span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <MdArrowDropDown className="w-5 h-5 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
            <Listbox.Options className="absolute w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {!hideSearch && (
                <div className="relative px-3 mb-3 cursor-default select-none">
                  <input
                    type="search"
                    placeholder="Search"
                    className="w-full px-0 border-0 border-b focus:outline-none focus:shadow-none focus:ring-0 focus:border-b focus:border-black"
                    value={searchKeyword}
                    onChange={(evt) => searchItem(evt.target.value)}
                  />
                </div>
              )}
              {items?.map((person, personIdx) => (
                <Listbox.Option
                  key={personIdx}
                  className={({ active }) => clsx(`relative cursor-default select-none py-2 px-3`, active && 'bg-[#f2f2f2]')}
                  value={person}>
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{person.name}</span>
                      {selected ? (
                        <span className="absolute inset-y-0 flex items-center pl-3 right-3 text-slate">
                          <MdCheckBox className="w-5 h-5" aria-hidden="true" />
                        </span>
                      ) : (
                        <span className="absolute inset-y-0 flex items-center pl-3 right-3 text-slate">
                          <MdCheckBoxOutlineBlank className="w-5 h-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
      {hint && <span className={clsx('text-xs', theme.hintColor)}>{hint}</span>}
    </div>
  )
}
