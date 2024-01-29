import clsx from 'clsx'
import { HTMLProps } from 'react'

interface CheckboxesItem extends Omit<HTMLProps<HTMLInputElement>, 'label'> {
  label?: string | JSX.Element
}
interface CheckboxesProps extends HTMLProps<HTMLInputElement> {
  items: CheckboxesItem | CheckboxesItem[]
  centered?: boolean
  disabled?: boolean
  name?: string
  label?: string
  containerClass?: string
  defaultChecked?: boolean
  setFieldValue?: (field?: any, name?: any, shouldValidate?: boolean) => void
}

export const Checkboxes: React.FC<CheckboxesProps> = ({
  items,
  centered = true,
  disabled,
  name,
  label,
  containerClass,
  ...rest
}) => {
  // if items is not array
  if (!Array.isArray(items)) {
    return (
      <label className={clsx('inline-flex space-x-2', centered && 'items-center')}>
        <input
          type="checkbox"
          name={name}
          className={clsx(
            'w-[1.1rem] h-[1.1rem] bg-transparent border-white border-[1.5px] rounded-sm focus:ring-0 text-primary focus-within:border-0 disabled:border-outline',
            !centered && 'mt-[.3rem]'
          )}
          disabled={disabled}
          // defaultChecked={items?.defaultChecked}
          {...rest}
          value={items?.value}
        />
        {items?.label && <span className={clsx('font-light text-dark', disabled && 'text-outline')}>{items?.label}</span>}
      </label>
    )
  }
  return (
    <div className="flex flex-col flex-1 space-y-3">
      {label && <span className={clsx('text-xs')}>{label}</span>}
      <div className={clsx('md:flex md:items-center md:space-x-5 grid grid-cols-2 gap-y-2 md:gap-y-0', containerClass)}>
        {items?.map((item, i) => (
          <label key={i} className={clsx('inline-flex space-x-2', centered && 'items-center')}>
            <input
              type="checkbox"
              name={name}
              className={clsx(
                'w-[1.1rem] h-[1.1rem] bg-transparent border-white border-[1.5px] rounded-sm focus:ring-0 text-primary focus-within:border-0 disabled:border-outline',
                !centered && 'mt-[.3rem]'
              )}
              disabled={disabled}
              // defaultChecked={item?.defaultChecked || !!item?.value}
              {...rest}
              value={item?.value}
            />
            {item?.label && <span className={clsx('font-light text-dark', disabled && 'text-outline')}>{item?.label}</span>}
          </label>
        ))}
      </div>
    </div>
  )
}
