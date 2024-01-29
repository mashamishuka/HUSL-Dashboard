import { MdContentCopy, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { toast } from 'react-toastify'
import { useCopyToClipboard, useToggle } from 'react-use'

interface EncryptedTextProps {
  text?: string
  defaultShow?: boolean
}
export const EncryptedText: React.FC<EncryptedTextProps> = ({ text, defaultShow = false }) => {
  const [decrypted, setDecrypted] = useToggle(defaultShow)
  const [, copyToClipboard] = useCopyToClipboard()

  const handleCopyToClipboard = () => {
    if (!text) {
      toast.error('Nothing to copy.')
      return
    }
    copyToClipboard(text)
    toast.success('Password copied to clipboard')
  }
  return (
    <div className="flex items-center space-x-4">
      {!decrypted ? (
        <div className="flex items-center space-x-px">
          {[...Array(text?.length)].map((_, i) => (
            <span key={i} className="w-2 h-2 bg-white rounded-full" />
          ))}
        </div>
      ) : (
        <span>{text}</span>
      )}
      <div className="flex items-center space-x-2">
        <button onClick={setDecrypted}>{decrypted ? <MdVisibility /> : <MdVisibilityOff />}</button>
        <button onClick={handleCopyToClipboard}>
          <MdContentCopy className="text-sm" />
        </button>
      </div>
    </div>
  )
}
