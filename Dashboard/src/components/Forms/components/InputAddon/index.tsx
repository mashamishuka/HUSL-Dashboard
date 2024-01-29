import clsx from 'clsx'
import { HTMLProps, useMemo, useState } from 'react'
import { MdVisibility, MdVisibilityOff } from 'react-icons/md'

interface InputAddonProps extends HTMLProps<HTMLInputElement> {
  className?: string
  label?: string
  hint?: string
  variant?: 'default' | 'error' | 'success' | 'dark'
  append?: React.ReactNode | string
  containerClass?: string
  error?: string
  addonText?: React.ReactNode | string
}

export const InputAddon: React.FC<InputAddonProps> = ({
  className,
  label,
  required,
  type: inputType,
  hint,
  variant = 'default',
  append,
  containerClass,
  error,
  addonText,
  ...rest
}) => {
  const [type, setType] = useState(inputType)

  const theme = useMemo(() => {
    let className = {
      labelColor: 'text-white',
      hintColor: 'text-gray-400',
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

  return (
    <div className={clsx('flex flex-col space-y-1', containerClass)}>
      {label && (
        <label className={clsx('text-sm font-light text-left', theme.labelColor)}>
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <div className="relative">
        <div className="flex mt-1 rounded-md shadow-sm">
          {addonText && (
            <span
              className={clsx(
                'inline-flex w-48 items-center px-5 border border-r-0 rounded-l-md text-sm whitespace-nowrap',
                theme.borderColor
              )}>
              {addonText}
            </span>
          )}

          {inputType === 'textarea' && (
            <textarea
              className={clsx(
                'px-4 py-3 rounded-r-xl bg-transparent focus:outline-none border w-full font-light text-sm disabled:border-opacity-10 disabled:text-opacity-10',
                `placeholder:${theme.hintColor} placeholder:text-opacity-80`,
                theme.borderColor,
                className
              )}
              required={required}
              {...(rest as any)}
            />
          )}
          {inputType !== 'textarea' && (
            <input
              type={type}
              className={clsx(
                'px-4 py-3 rounded-r-xl bg-transparent focus:outline-none border w-full font-light text-sm disabled:border-opacity-10 disabled:text-opacity-10',
                `placeholder:${theme.hintColor} placeholder:text-opacity-80`,
                theme.borderColor,
                className
              )}
              required={required}
              {...rest}
            />
          )}
        </div>

        {inputType === 'password' && (
          <button
            type="button"
            className="absolute text-[#8C8CA1] transform -translate-y-1/2 top-1/2 right-3 text-base disabled:border-opacity-10 disabled:text-opacity-10"
            onClick={() => (type === 'password' ? setType('text') : setType('password'))}>
            {type === 'password' ? <MdVisibility className="text-2xl" /> : <MdVisibilityOff className="text-2xl" />}
          </button>
        )}
        {append && inputType !== 'password' && (
          <span className="absolute text-[#8C8CA1] transform -translate-y-1/2 top-1/2 right-3 text-base">{append}</span>
        )}
      </div>
      {hint && <span className={clsx('text-xs font-light text-left', theme.hintColor)}>{hint}</span>}
      {error && <span className={clsx('text-xs font-light text-left text-red-400', theme.hintColor)}>{error}</span>}
    </div>
  )
}
