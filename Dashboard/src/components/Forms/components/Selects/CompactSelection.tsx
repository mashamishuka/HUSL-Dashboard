import { useMemo, useState, useEffect } from 'react'
import clsx from 'clsx'
import Select, { Props } from 'react-select'

type itemOption = {
  label: string
  value: string
}
export interface CompactSelectionProps extends Props {
  name?: string
  className?: string
  label?: string
  hint?: string
  variant?: 'default' | 'error' | 'success' | 'dark'
  required?: boolean
  placeholder?: string
  items?: itemOption[]
  value?: itemOption[]
  setFieldValue?: (field: string, value: any, shouldValidate?: boolean) => void
  onChange?: (value: any) => void
  isMulti?: boolean
}

export const CompactSelection: React.FC<CompactSelectionProps> = ({
  hint,
  variant,
  label,
  required,
  placeholder,
  className,
  items = [],
  setFieldValue,
  name,
  onChange,
  isMulti = true,
  ...props
}) => {
  const [options, setOptions] = useState<itemOption[]>([])

  const handleChange = (selectedOptions: itemOption[]) => {
    if (!name) return
    setFieldValue?.(name, selectedOptions)
    onChange?.(selectedOptions)
  }
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
    setOptions(items)
  }, [items])
  return (
    <div className="flex flex-col">
      {label && (
        <label className={clsx('text-sm font-light', theme.labelColor)}>
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <Select
        isMulti={isMulti}
        name="colors"
        options={options}
        className={clsx('', `placeholder:${theme.hintColor} placeholder:text-opacity-80`, theme.borderColor, className)}
        classNamePrefix="select"
        placeholder={placeholder}
        classNames={{
          container: () => clsx('p-0'),
          control: () =>
            clsx(
              '!bg-transparent border-0 !rounded-xl px-0 py-0 !shadow-none font-base focus:outline-none !border-none w-full font-light text-xs disabled:text-opacity-10'
            ),
          valueContainer: () => clsx('!p-0'),
          menu: () => clsx('!bg-dark'),
          option: () => clsx('!bg-dark hover:!bg-secondary'),
          multiValue: () => clsx('!bg-secondary'),
          multiValueLabel: () => clsx('!text-white border-l border-b border-t border-gray-500 !rounded-r-none'),
          singleValue: () => clsx('!text-white'),
          indicatorSeparator: () => clsx('!hidden'),
          multiValueRemove: () =>
            clsx('!text-white hover:!bg-danger border-t border-b border-r !rounded-l-none border-gray-500'),
          menuList: () => clsx('text-xs')
        }}
        isClearable
        onChange={(e: any) => {
          handleChange(e)
        }}
        {...props}
      />
      {hint && <span className={clsx('text-xs', theme.hintColor)}>{hint}</span>}
    </div>
  )
}
