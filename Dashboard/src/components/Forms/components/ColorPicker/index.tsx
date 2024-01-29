import clsx from 'clsx'
import { HTMLProps, useMemo, useRef, useState } from 'react'
import { BlockPicker } from 'react-color'
import { useClickAway, useToggle, useUpdateEffect } from 'react-use'

interface ColorPickerProps extends HTMLProps<HTMLInputElement> {
  className?: string
  label?: string
  hint?: string
  variant?: 'default' | 'error' | 'success' | 'dark'
  containerClass?: string
  error?: string
  required?: boolean
  defaultColor?: string
  setFieldValue?: (field?: any, name?: any, shouldValidate?: boolean) => void
}
export const ColorPicker: React.FC<ColorPickerProps> = ({
  className,
  label,
  hint,
  variant = 'default',
  containerClass,
  error,
  required,
  defaultColor = '#BA954F',
  setFieldValue,
  name,
  ...rest
}) => {
  const [color, setColor] = useState(defaultColor)
  const [showPicker, setShowPicker] = useToggle(false)
  const [inputFocus, setInputFocus] = useToggle(false)
  const pickerRef = useRef<any>(null)

  useClickAway(pickerRef, () => {
    if (showPicker && !inputFocus) {
      setShowPicker(false)
    }
  })

  useUpdateEffect(() => {
    setFieldValue?.(name, color)
  }, [color])

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
        <input
          className={clsx(
            'px-4 py-3 rounded-xl bg-transparent focus:outline-none border w-full font-light text-sm disabled:border-opacity-10 disabled:text-opacity-10',
            `placeholder:${theme.hintColor} placeholder:text-opacity-80`,
            theme.borderColor,
            className
          )}
          required={required}
          value={color}
          onChange={(e) => setColor(e?.target?.value)}
          onFocus={() => {
            setShowPicker(true)
            setInputFocus(true)
          }}
          onBlur={() => setInputFocus(false)}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              setShowPicker(false)
            }
          }}
          {...rest}
        />
        {showPicker && (
          <div ref={pickerRef}>
            <BlockPicker
              className={clsx('mt-3 !absolute z-20', className)}
              color={color}
              onChangeComplete={(c) => {
                setColor(c.hex)
                setShowPicker(false)
              }}
            />
          </div>
        )}
      </div>
      {hint && <span className={clsx('text-xs font-light text-left', theme.hintColor)}>{hint}</span>}
      {error && <span className={clsx('text-xs font-light text-left text-red-400', theme.hintColor)}>{error}</span>}
    </div>
  )
}
