import { UploadModal } from '@components/FileManager/Misc/UploadModal'
import { ChangeEvent, useState } from 'react'
import { MdCloudUpload } from 'react-icons/md'
import { toast } from 'react-toastify'

interface UploadFileProps {
  initialFolder?: string
}
export const UploadFile: React.FC<UploadFileProps> = ({ initialFolder }) => {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [preview, setPreview] = useState<string>()
  const [files, setFiles] = useState<FileList>()

  const handleFileChange = (evt: ChangeEvent<HTMLInputElement>) => {
    if (!evt.target.files?.[0]) {
      toast.error('No files selected.')
      return
    }
    setShowUploadModal(true)
    if (evt.target.files.length == 1) {
      const objectUrl = URL.createObjectURL(evt.target.files?.[0])
      setPreview(objectUrl)
    } else {
      setPreview(undefined)
    }
    setFiles(evt.target.files)
  }

  return (
    <div>
      <label className="inline-flex items-center justify-center rounded-lg cursor-pointer group h-[42px] w-[42px] hover:bg-secondary hover:text-primary">
        <MdCloudUpload className="text-2xl" />
        <input type="file" className="w-0 h-0" onChange={handleFileChange} multiple />
      </label>
      <UploadModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        data={{
          preview,
          files
        }}
        initialFolder={initialFolder}
      />
    </div>
  )
}
