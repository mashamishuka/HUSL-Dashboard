import clsx from 'clsx'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { MdArrowDropDown } from 'react-icons/md'

import { Listbox, Transition } from '@headlessui/react'
import { useDebounce } from 'react-use'

export interface SingleSelectProps {
  className?: string
  label?: string | React.ReactNode
  hint?: string | React.ReactNode
  variant?: 'default' | 'error' | 'success' | 'dark'
  append?: React.ReactNode | string
  required?: boolean
  hideSearch?: boolean
  name?: string
  error?: string
  value?: string
  selectedLabel?: string
  onBlur?: (evt: any) => void
  onChange?: (evt: any) => void
  setFieldValue?: (field?: any, name?: any, shouldValidate?: boolean) => void
  items?: {
    label?: string
    value: string
  }[]
  onSearch?: (searchString: string) => void
}

export const SingleSelect: React.FC<SingleSelectProps> = ({
  hint,
  variant,
  label,
  className,
  hideSearch,
  name,
  required,
  value,
  selectedLabel,
  error,
  items = [],
  setFieldValue,
  onChange,
  onSearch,
  ...rest
}) => {
  const valueRef = useRef<HTMLInputElement>(null)
  const [selected, setSelected] = useState(items[0])
  const [options, setOptions] = useState<any[]>(items)
  const [searchKeyword, setSearchKeyword] = useState('')

  const searchItem = (search?: string) => {
    setSearchKeyword(search || '')
    // if on search is provided, return null since we don't want to filter the items
    // we want to use debounce to search the items from api for example
    if (onSearch) {
      return
    }
    if (!search) {
      setOptions(items)
      return
    }
    const newItems = items.filter(
      (item) =>
        item.value?.toLowerCase().includes(search?.toLowerCase()) ||
        item.label?.toLowerCase().includes(search?.toLowerCase())
    )
    setOptions(newItems)
  }

  const handleSelected = (value: any) => {
    setFieldValue?.(name, value?.value || undefined)
    onChange?.(value?.value || undefined)
    setSelected(value)
  }

  useDebounce(
    () => {
      if (onSearch) {
        onSearch(searchKeyword)
      }
    },
    500,
    [searchKeyword]
  )

  const theme = useMemo(() => {
    let className = {
      labelColor: 'text-white',
      hintColor: 'text-white',
      borderColor: 'border-white border-opacity-40'
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
      case 'dark':
        className = {
          labelColor: 'text-white',
          hintColor: 'text-gray-400',
          borderColor: 'border-secondary'
        }
        break
      default:
        break
    }
    return className
  }, [variant])

  useEffect(() => {
    if (value) {
      setSelected({ value, label: selectedLabel || value })
    }
    return () => {
      setSelected(items[0])
    }
  }, [value])

  /**
   * Dispatch Event on Real DOM on Change
   */
  // useEffect(() => {
  //   setFieldValue?.(name, selected?.value)
  //   return () => {
  //     setFieldValue?.(name, undefined)
  //   }
  // }, [selected])

  // useEffect(() => {
  //   if (items?.length) {
  //     setOptions(items)
  //   }
  //   return () => {
  //     setOptions([])
  //   }
  // }, [items])

  if (!items.length) {
    return <></>
  }
  return (
    <div className="flex flex-col">
      {label && (
        <label className={clsx('text-sm font-light', theme.labelColor)}>
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <input ref={valueRef} type="hidden" name={name} defaultValue={selected?.value} {...rest} />
      <Listbox value={selected} onChange={(v) => handleSelected(v)}>
        <div className="relative my-1">
          <Listbox.Button
            className={clsx(
              'px-4 py-3 rounded-xl bg-transparent focus:outline-none border w-full font-light text-sm text-left',
              `placeholder:${theme.hintColor}`,
              theme.borderColor,
              className
            )}>
            <span className="block truncate">{selected?.label || selected?.value}</span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <MdArrowDropDown className="w-5 h-5 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
            <Listbox.Options className="absolute w-full py-1 mt-1 overflow-auto text-base bg-[#181818] rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
              {!hideSearch && (
                <div className="relative px-3 mb-3 cursor-default select-none">
                  <input
                    type="search"
                    placeholder="Search"
                    className="w-full px-0 border-0 border-b focus:outline-none focus:shadow-none focus:ring-0 focus:border-b focus:border-black bg-dark"
                    value={searchKeyword}
                    onChange={(evt) => searchItem(evt.target.value)}
                  />
                </div>
              )}
              {options?.map((item, itemIdx) => (
                <Listbox.Option
                  key={itemIdx}
                  className={({ active }) => clsx(`relative cursor-default select-none`, active && 'bg-secondary')}
                  value={item}>
                  {({ selected }) => (
                    <span className={clsx(`block py-2 px-3 truncate text-base`, selected && 'bg-secondary')}>
                      {item?.label || item?.value}
                    </span>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
      {hint && <span className={clsx('text-xs font-light', theme.hintColor)}>{hint}</span>}
      {error && <span className={clsx('text-xs font-light text-red-400')}>{error}</span>}
    </div>
  )
}
