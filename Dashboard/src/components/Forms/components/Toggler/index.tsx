import clsx from 'clsx'
import { HTMLProps, useEffect, useState } from 'react'

import { Switch } from '@headlessui/react'

interface TogglerProps extends HTMLProps<HTMLInputElement> {
  onSwitch?: (state: boolean) => void
  defaultChecked?: boolean
}
export const Toggler: React.FC<TogglerProps> = ({ defaultChecked = false, onSwitch, disabled, ...props }) => {
  const [enabled, setEnabled] = useState(defaultChecked)

  useEffect(() => {
    if (disabled) return
    if (onSwitch) {
      onSwitch?.(enabled)
    }
  }, [enabled])
  useEffect(() => {
    if (disabled) return
    if (typeof defaultChecked !== 'undefined') {
      setEnabled(defaultChecked)
    }
  }, [defaultChecked])
  return (
    <>
      <Switch
        checked={enabled}
        onChange={(state: boolean) => !disabled && setEnabled(state)}
        className={clsx(
          enabled ? 'border-primaryBlue' : 'bg-transparent',
          'relative inline-flex h-4 w-9 flex-shrink-0 cursor-pointer rounded-full border items-center'
        )}>
        <span
          aria-hidden="true"
          className={clsx(
            enabled ? 'translate-x-5 bg-primaryBlue' : 'translate-x-0 bg-white',
            'pointer-events-none inline-block h-4 w-4 transform rounded-full transition duration-200 ease-in-out'
          )}
        />
      </Switch>
      <input
        {...props}
        type="hidden"
        value={enabled?.toString()}
        onChange={() => !disabled && setEnabled(!enabled)}
        defaultChecked={defaultChecked}
      />
    </>
  )
}
