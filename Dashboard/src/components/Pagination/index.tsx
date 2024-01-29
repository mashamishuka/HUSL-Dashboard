import clsx from 'clsx'
import { useMemo } from 'react'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'
import ReactPaginate from 'react-paginate'

interface PaginationProps {
  initialPage?: number
  onPageChange?: (page?: number) => void
  pageCount?: number
  className?: string
}
export const Pagination: React.FC<PaginationProps> = ({ initialPage, onPageChange, pageCount, className }) => {
  // if (!pageCount) return <></>
  return (
    <ReactPaginate
      breakLabel="..."
      initialPage={initialPage}
      className={clsx('flex items-center justify-center mt-5 space-x-2', className)}
      pageLinkClassName="w-8 h-8 flex items-center justify-center text-gray-500"
      activeLinkClassName="!text-white"
      activeClassName="w-8 h-8 flex items-center justify-center bg-primary rounded-md"
      nextClassName={clsx('w-8 h-8 flex items-center justify-center', !pageCount && 'hidden')}
      previousClassName={clsx('w-8 h-8 flex items-center justify-center', !pageCount && 'hidden')}
      breakClassName="w-8 h-8 flex items-center justify-center"
      nextLabel={<MdChevronRight width={18} className="text-gray-500" />}
      onPageChange={({ selected }) => {
        onPageChange?.(selected + 1)
      }}
      pageRangeDisplayed={2}
      pageCount={pageCount || 0}
      previousLabel={<MdChevronLeft width={18} className="text-gray-500" />}
    />
  )
}

interface NextPrevProps {
  initialPage?: number
  onPageChange?: (page?: number) => void
  currentDataCount?: number
  dataPerPage?: number
  isLoading?: boolean
}
export const NextPrev: React.FC<NextPrevProps> = ({
  initialPage,
  onPageChange,
  currentDataCount,
  dataPerPage,
  isLoading
}) => {
  const handlePageChange = (type: 'prev' | 'next') => {
    if (!initialPage) {
      onPageChange?.(1)
      return
    }
    if (type === 'prev') {
      onPageChange?.(initialPage - 1)
    } else {
      onPageChange?.(initialPage + 1)
    }
  }

  const isPrevDisabled = useMemo(() => {
    if (isLoading) return true
    if (!initialPage) return true
    if (initialPage === 1) return true
    return false
  }, [initialPage, isLoading])
  const isNextDisabled = useMemo(() => {
    if (isLoading) return true
    if (!initialPage) return true
    if (currentDataCount === dataPerPage) return false
    return true
  }, [currentDataCount, dataPerPage])
  return (
    <div className="flex items-center justify-center mt-5 space-x-2">
      <button
        disabled={isPrevDisabled}
        className="flex items-center px-3 py-2 space-x-2 text-sm border rounded-lg border-primary text-primary disabled:opacity-70"
        onClick={() => handlePageChange('prev')}>
        <MdChevronLeft width={20} />
        <span>Previous</span>
      </button>
      <button
        disabled={isNextDisabled}
        className="flex items-center px-3 py-2 space-x-2 text-sm border rounded-lg border-primary text-primary disabled:opacity-70"
        onClick={() => handlePageChange('next')}>
        <span>Next</span>
        <MdChevronRight width={20} />
      </button>
    </div>
  )
}
