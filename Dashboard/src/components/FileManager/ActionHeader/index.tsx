import { useRouter } from 'next/router'
import { FiChevronLeft } from 'react-icons/fi'
import { UploadAction } from './UploadAction'

interface ActionHeaderProps {
  title?: string
  initialFolder?: string
}
export const ActionHeader: React.FC<ActionHeaderProps> = ({ title, initialFolder }) => {
  const { query, back } = useRouter()
  const folder = query.folder as string[]

  return (
    <header className="sticky z-10 flex flex-col justify-between space-y-3 md:items-center top-32 md:flex-row md:space-y-0">
      {folder?.length > 0 ? (
        <div className="flex items-center space-x-3">
          <button onClick={back}>
            <FiChevronLeft className="mb-0.5" />
          </button>
          <div className="flex items-center space-x-5">
            <span>{[...folder].pop()}</span>
          </div>
        </div>
      ) : (
        <span>{title}</span>
      )}
      <div>
        {/* Upload Action */}
        <UploadAction initialFolder={initialFolder} />
      </div>
    </header>
  )
}
