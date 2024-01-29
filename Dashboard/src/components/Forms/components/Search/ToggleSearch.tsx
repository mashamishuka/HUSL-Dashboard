import clsx from 'clsx'
import { HTMLProps, useRef, useState } from 'react'
import { MdSearch } from 'react-icons/md'
import { useToggle, useUpdateEffect } from 'react-use'

interface ToggleSearchProps extends HTMLProps<HTMLInputElement> {
  placeholder?: string
  note?: string
  loading?: boolean
  loadingText?: string
}
export const ToggleSearch: React.FC<ToggleSearchProps> = ({
  placeholder = 'Search...',
  note,
  loading = false,
  loadingText = 'Entering...',
  name
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [showSearch, setShowSearch] = useToggle(false)
  const [value, setValue] = useState('')

  useUpdateEffect(() => {
    if (showSearch) inputRef.current?.focus()
    else inputRef.current?.blur()
  }, [showSearch])
  return (
    <div className="-mr-3">
      <label className="relative">
        {loading ? (
          <input
            ref={inputRef}
            type="text"
            className={clsx(
              'px-4 py-2 bg-transparent',
              showSearch ? 'w-full border rounded-lg border-outline focus-within:border-dark focus:ring-0' : 'border-0 w-0'
            )}
            placeholder={showSearch ? placeholder : ''}
            value={loadingText}
          />
        ) : (
          <input
            ref={inputRef}
            type="text"
            className={clsx(
              'px-4 py-2 bg-transparent',
              showSearch ? 'w-full border rounded-lg border-outline focus-within:border-dark focus:ring-0' : 'border-0 w-0'
            )}
            placeholder={showSearch ? placeholder : ''}
            value={value}
            onChange={(evt) => setValue(evt.target.value)}
            name={name}
          />
        )}
        <button
          onClick={() => !value && setShowSearch(!showSearch)}
          className="absolute right-0 px-4 py-2 text-2xl transform -translate-y-1/2 top-1/2">
          <MdSearch />
        </button>
      </label>
      {note && <span className="text-xs font-light text-hint">156 Results found</span>}
    </div>
  )
}
