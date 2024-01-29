import { useMemo, useState, useEffect } from 'react'
import clsx from 'clsx'
import Select, { Props } from 'react-select'

type itemOption = {
  label: string
  value: string
}
export interface SelectionProps extends Props {
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

export const Selection: React.FC<SelectionProps> = ({
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
    <div className="flex flex-col !text-white">
      {label && (
        <label className={clsx('text-sm font-light', theme.labelColor)}>
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <Select
        isMulti={isMulti}
        name="colors"
        options={options}
        className={clsx(
          '!text-white',
          `placeholder:${theme.hintColor} placeholder:text-opacity-80`,
          theme.borderColor,
          className
        )}
        classNamePrefix="select"
        placeholder={placeholder}
        classNames={{
          container: () => clsx('p-0'),
          control: () =>
            clsx(
              '!bg-transparent border-0 !rounded-xl px-2.5 py-1 font-base !border-gray-500 focus:outline-none !border w-full font-light text-sm disabled:border-opacity-10 disabled:text-opacity-10'
            ),
          menu: () => clsx('!bg-dark !text-white'),
          option: () => clsx('!bg-dark hover:!bg-secondary '),
          multiValue: () => clsx('!bg-secondary !text-white'),
          multiValueLabel: () => clsx('!text-white border-l border-b border-t border-gray-500 !rounded-r-none'),
          singleValue: () => clsx('!text-white'),
          multiValueRemove: () =>
            clsx('!text-white hover:!bg-danger border-t border-b border-r !rounded-l-none border-gray-500')
        }}
        styles={{
          input: (baseStyles) => ({
            ...baseStyles,
            color: 'white'
          })
        }}
        isClearable
        onChange={(e: any) => {
          handleChange(e)
        }}
        {...props}
      />
      {hint && <span className={clsx('text-xs', 'text-danger')}>{hint}</span>}
    </div>
  )
}
