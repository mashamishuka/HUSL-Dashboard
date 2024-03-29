import clsx from 'clsx'
import { HTMLProps, useMemo } from 'react'

interface TextAreaProps extends HTMLProps<HTMLTextAreaElement> {
  className?: string
  label?: string
  hint?: string
  variant?: 'default' | 'error' | 'success' | 'dark'
  append?: React.ReactNode | string
  containerClass?: string
  error?: string
}

export const TextArea: React.FC<TextAreaProps> = ({
  className,
  label,
  required,
  hint,
  variant = 'default',
  containerClass,
  error,
  ...rest
}) => {
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
        <textarea
          rows={5}
          className={clsx(
            'px-4 py-3 rounded-xl bg-transparent focus:outline-none border w-full font-light text-sm disabled:border-opacity-10 disabled:text-opacity-10',
            `placeholder:${theme.hintColor} placeholder:text-opacity-80`,
            theme.borderColor,
            className
          )}
          required={required}
          {...rest}
        />
      </div>
      {hint && <span className={clsx('text-xs font-light text-left', theme.hintColor)}>{hint}</span>}
      {error && <span className={clsx('text-xs font-light text-left text-red-400', theme.hintColor)}>{error}</span>}
    </div>
  )
}
