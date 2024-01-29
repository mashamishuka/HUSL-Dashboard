import clsx from 'clsx'
import { HTMLProps } from 'react'
import { MdClose, MdInfo } from 'react-icons/md'
import { useToggle } from 'react-use'

interface InfoAlertProps extends HTMLProps<HTMLDivElement> {
  hideClose?: boolean
}
export const InfoAlert: React.FC<InfoAlertProps> = ({ className, children, hideClose, ...rest }) => {
  const [show, setShow] = useToggle(true)

  if (!show) {
    return <></>
  }
  return (
    <div className={clsx('relative p-4 border-l-4 bg-dark border-blue-500', className)} {...rest}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <MdInfo className="w-5 h-5 text-blue-500" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <span className="text-sm">{children}</span>
        </div>
      </div>
      {!hideClose && (
        <button onClick={setShow} className="absolute text-lg transform -translate-y-1/2 right-5 top-1/2">
          <MdClose />
        </button>
      )}
    </div>
  )
}
