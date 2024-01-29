import { ExclamationTriangleIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { HTMLProps } from 'react'

export const ErrorAlert: React.FC<HTMLProps<HTMLDivElement>> = ({ className, children, ...rest }) => {
  return (
    <div className={clsx('p-4 border-l-4 bg-dark border-danger', className)} {...rest}>
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="w-5 h-5 text-danger" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <span className="text-sm">{children}</span>
        </div>
      </div>
    </div>
  )
}
