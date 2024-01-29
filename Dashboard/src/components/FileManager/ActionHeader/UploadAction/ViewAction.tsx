import { PreviewList } from '@components/Icons'
import { useFileManagerView } from '@hooks/useFileManagerView'
import { FiGrid } from 'react-icons/fi'

export const ViewAction: React.FC = () => {
  const { viewType, toggleViewType } = useFileManagerView()

  return (
    <button
      onClick={toggleViewType}
      className="inline-flex items-center justify-center text-lg rounded-lg cursor-pointer group h-[42px] w-[42px] hover:bg-secondary hover:text-primary">
      {viewType === 'grid' ? <PreviewList /> : <FiGrid className="text-lg" />}
    </button>
  )
}
