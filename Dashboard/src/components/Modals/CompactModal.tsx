import { Dialog } from '@headlessui/react'
import { MdClose } from 'react-icons/md'

interface CompactModal {
  show: boolean
  // onShow?: boolean
  onClose?: () => void
  width?: string
  pos?: {
    y: number
    x: number
  }
  horizontalPos?: 'left' | 'right'
}

export const CompactModal: React.FC<CompactModal> = ({
  show,
  children,
  onClose,
  width = '24rem',
  pos,
  horizontalPos = 'left'
}) => {
  return (
    <Dialog
      open={show}
      as="div"
      className="fixed inset-0 right-0 z-50 overflow-y-auto"
      onClose={() => onClose?.()}
      style={{
        [horizontalPos]: `calc(${pos?.x}px - ${width})`,
        top: pos?.y,
        width
      }}>
      <div
        className="relative inline-block w-full p-5 overflow-hidden text-left align-middle transition-all transform border rounded-lg shadow-lg bg-[#2B2A2A] border-dark"
        style={{
          width
        }}>
        {children}
        <button type="button" className="absolute right-5 top-3" onClick={() => onClose && onClose()}>
          <MdClose width={24} />
        </button>
      </div>
    </Dialog>
  )
}
