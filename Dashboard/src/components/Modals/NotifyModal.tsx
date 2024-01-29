import { Dialog } from '@headlessui/react'
import { MdClose } from 'react-icons/md'

interface NotifyModal {
  show: boolean
  onClose?: () => void
  width?: string
  minHeight?: string
  center?: boolean
  pos?: {
    y: number | string
    x: number | string
  }
  horizontalPos?: 'left' | 'right'
  nonInnerWidth?: boolean
}

export const NotifyModal: React.FC<NotifyModal> = ({
  show,
  children,
  onClose,
  width = '24rem',
  minHeight = '24rem',
  pos,
  center,
  horizontalPos = 'left',
  nonInnerWidth = false
}) => {
  return (
    <Dialog
      open={show}
      as="div"
      className="fixed inset-0 right-0 z-50 overflow-y-auto"
      onClose={() => onClose?.()}
      style={{
        [horizontalPos]: center ? '50%' : `calc(${pos?.x}px - ${width})`,
        top: center ? '50%' : pos?.y,
        transform: center ? 'translate(-50%, -50%)' : 'initial',
        width,
        minHeight: minHeight ? minHeight : 'initial'
      }}>
      <div
        className="relative inline-block w-full p-5 overflow-hidden text-left align-middle transition-all transform border rounded-lg shadow-lg bg-[#2B2A2A] border-dark"
        style={!nonInnerWidth ? { width } : {}}>
        {children}
        <button type="button" className="absolute right-5 top-3" onClick={() => onClose && onClose()}>
          <MdClose width={24} />
        </button>
      </div>
    </Dialog>
  )
}
