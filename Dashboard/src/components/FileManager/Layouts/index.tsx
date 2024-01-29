import { useFileManagerView } from '@hooks/useFileManagerView'
import { useHeaderHeight } from '@hooks/useHeaderHeight'
import { useHookstate } from '@hookstate/core'
import { layoutTypeState } from '@states/fileManagers/layoutType'
import { selectedFilesState } from '@states/fileManagers/selectedFiles'
import clsx from 'clsx'
import { useRef } from 'react'
import { handleFileManagerRootClick } from '../actions/handleFileManagerRootClick'
import { ListFolderCard, GridFileCard, GridFolderCard, ListFileCard } from '../Cards'
import { NoPreviewFile } from '../Misc/NoPreviewFile'
import { PreviewFileDetail } from '../Misc/PreviewFileDetail'

interface ManagerLayoutProps {
  folders?: FileManager.Folder[]
  files?: FileManager.File[]
  initialFolder?: string
}
export const ManagerLayout: React.FC<ManagerLayoutProps> = ({ folders, files, initialFolder }) => {
  const { viewType } = useFileManagerView()
  const layoutType = useHookstate(layoutTypeState)
  const layout = layoutType.get()
  const { headerHeight } = useHeaderHeight()
  const layoutRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const selectedFiles = useHookstate(selectedFilesState)

  const handleClickRoot = (evt: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // if the user clicks on the layout, then unselect all files
    if (evt.target === layoutRef.current || evt.target === gridRef.current || evt.target === listRef.current) {
      selectedFiles.set({})
    }
  }
  if (!folders?.length && !files?.length) {
    return (
      <span>
        <p className="block mt-5 text-sm text-gray-400 ml-7">This folder has no content.</p>
      </span>
    )
  }
  return (
    <div
      ref={layoutRef}
      onClick={handleClickRoot}
      onContextMenu={handleFileManagerRootClick}
      className="relative z-0 flex space-x-6 lg:overflow-hidden grow">
      <div
        className="w-full mt-5 overflow-y-auto"
        style={{
          maxHeight: `calc(100vh - ${headerHeight}px - 72px)`
        }}>
        {viewType === 'list' && (
          <div ref={listRef} className="flex flex-col">
            {folders?.map((folder, i) => (
              <ListFolderCard key={i} {...folder} />
            ))}

            {files?.map((file, i) => (
              <ListFileCard key={i} {...file} />
            ))}
          </div>
        )}
        {viewType === 'grid' && (
          <div
            ref={gridRef}
            className={clsx(
              'px-4 lg:h-full lg:w-full lg:overflow-y-auto lg:px-0',
              layout.type === 'full' ? 'grid-view' : 'grid-view-sidebar'
            )}>
            {folders?.map((folder, i) => (
              <GridFolderCard key={i} {...folder} />
            ))}

            {files?.map((file, i) => (
              <GridFileCard key={i} initialFolder={initialFolder} {...file} />
            ))}
          </div>
        )}
      </div>
      {layout.type === 'compact' && (
        <div className="fixed right-0 z-20 w-full p-5 pt-2 overflow-x-hidden overflow-y-auto lg:relative shrink-0 lg:px-2.5 lg:block xl:w-[280px] 2xl:w-[300px] top-50 lg:inset-0 bg-dark px-">
          {/* If there's no Preview */}
          {Object.keys(selectedFiles.get() || {})?.length === 0 ? <NoPreviewFile /> : <PreviewFileDetail />}
        </div>
      )}
    </div>
  )
}
