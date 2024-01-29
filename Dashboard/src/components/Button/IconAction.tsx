import clsx from 'clsx'
import { HTMLProps } from 'react'

export const IconAction: React.FC<HTMLProps<HTMLButtonElement>> = ({ children, type, className, ...rest }) => {
  return (
    <button
      type={(type as 'button') || 'button'}
      className={clsx(
        'inline-flex items-center justify-center text-lg rounded-lg cursor-pointer group h-[42px] w-[42px] hover:bg-secondary hover:text-primary disabled:hover:bg-transparent disabled:pointer-events-none disabled:opacity-40',
        className
      )}
      {...rest}>
      {children}
    </button>
  )
}
