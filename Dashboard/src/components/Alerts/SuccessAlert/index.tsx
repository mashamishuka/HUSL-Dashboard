import clsx from 'clsx'
import { HTMLProps, useState } from 'react'
import { MdClose, MdDone } from 'react-icons/md'

export const SuccessAlert: React.FC<HTMLProps<HTMLDivElement>> = ({ className, children, ...rest }) => {
  const [showAlert, setShowAlert] = useState(true)
  if (!showAlert) {
    return <></>
  }
  return (
    <div className={clsx('pl-4 border-l-4 pr-6 py-4 bg-dark border-success relative', className)} {...rest}>
      <div className="flex">
        <div className="flex-shrink-0">
          <MdDone className="w-5 h-5 text-success" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <span className="text-sm">{children}</span>
        </div>
        <button onClick={() => setShowAlert(false)} className="absolute text-xl transform -translate-y-1/2 right-5 top-1/2">
          <MdClose />
        </button>
      </div>
    </div>
  )
}
