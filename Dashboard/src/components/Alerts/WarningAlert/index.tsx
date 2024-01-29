import { ExclamationTriangleIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { HTMLProps } from 'react'
import { MdClose } from 'react-icons/md'
import { useToggle } from 'react-use'

interface WarningAlertProps extends HTMLProps<HTMLDivElement> {
  noHide?: boolean
}
export const WarningAlert: React.FC<WarningAlertProps> = ({ className, children, noHide, ...rest }) => {
  const [show, setShow] = useToggle(true)

  if (!show) {
    return <></>
  }
  return (
    <div className={clsx('relative py-4 pl-4 pr-10 border-l-4 bg-dark border-warning', className)} {...rest}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="w-5 h-5 text-warning" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <span className="text-sm">{children}</span>
        </div>
      </div>
      {!noHide && (
        <button onClick={setShow} className="absolute text-lg transform -translate-y-1/2 right-5 top-1/2">
          <MdClose />
        </button>
      )}
    </div>
  )
}
