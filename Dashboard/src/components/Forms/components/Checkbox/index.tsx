import clsx from 'clsx'
import { HTMLProps } from 'react'

type CheckboxItem = {
  name?: string
  label?: string | JSX.Element
  defaultChecked?: boolean
}
interface CheckboxProps extends HTMLProps<HTMLInputElement> {
  items: CheckboxItem | CheckboxItem[]
  centered?: boolean
  disabled?: boolean
  labelClassName?: string
}

export const Checkbox: React.FC<CheckboxProps> = ({ items, centered = true, disabled, labelClassName, ...rest }) => {
  // if items is not array
  if (!Array.isArray(items)) {
    return (
      <label className={clsx('inline-flex space-x-2', centered && 'items-center')}>
        <input
          type="checkbox"
          name={items?.name}
          className={clsx(
            'w-4 h-4 border-secondary border-2 checked:border-primary rounded-sm shadow-lg focus:ring-primary text-primary disabled:border-outline',
            !centered && 'mt-[.3rem]'
          )}
          disabled={disabled}
          defaultChecked={items?.defaultChecked}
          {...rest}
        />
        {items.label && (
          <span className={clsx('font-light text-dark', labelClassName, disabled && 'text-outline')}>{items.label}</span>
        )}
      </label>
    )
  }
  return (
    <>
      {items?.map((item, i) => (
        <label key={i} className={clsx('inline-flex space-x-2', centered && 'items-center')}>
          <input
            type="checkbox"
            name={item?.name}
            className={clsx(
              'w-4 h-4 border-secondary border-2 checked:border-primary rounded-sm shadow-lg focus:ring-primary text-primary disabled:border-outline',
              !centered && 'mt-[.3rem]'
            )}
            disabled={disabled}
            defaultChecked={item?.defaultChecked}
            {...rest}
          />
          {item?.label && (
            <span className={clsx('font-light text-dark', labelClassName, disabled && 'text-outline')}>{item.label}</span>
          )}
        </label>
      ))}
    </>
  )
}

export { Checkboxes } from './Checkboxes'
export { DatatableCheckbox } from './DatatableCheckbox'
