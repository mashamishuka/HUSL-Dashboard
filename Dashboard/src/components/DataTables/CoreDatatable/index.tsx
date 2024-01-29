import { WarningAlert } from '@components/Alerts'
import { DatatableCheckbox } from '@components/Forms/components'
import { Loading } from '@components/Icons'
import clsx from 'clsx'
import { FiArrowDown } from 'react-icons/fi'
import { usePagination, useSortBy, useTable, useRowSelect } from 'react-table'

const SorterIcon = ({ type }: { type?: 'asc' | 'desc' }) => {
  return (
    <div className="absolute inline-flex flex-col ml-2 transform -translate-y-1/2 top-1/2">
      <FiArrowDown width={12} className={clsx(type === 'asc' && 'transform rotate-180')} />
    </div>
  )
}

export type DataTableProps = {
  data: any
  row?: {
    original: any
  }
  loading?: boolean
  columns: any[]

  searchOnHeader?: boolean
  showPageInfo?: boolean
  showSearch?: boolean
  searchValue?: string
  totalData?: number
  limit?: number
  limitOptions?: number[]
  onSearch?: (data?: any) => void
  onLimitChange?: (limit?: number) => void
  deleteNotifications?: (data?: any) => void
  pageCount?: number
  currentPage?: number
  onRowClick?: (...args: any) => void
  onPageChange?: (page?: number, curr?: number) => void
  initialState?: Record<string, any>
  showSelection?: boolean

  showOverflow?: boolean
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  pageCount: controlledPageCount,
  currentPage = 1,
  onRowClick,
  initialState,
  deleteNotifications,
  showSelection = false,
  loading,
  showOverflow = false
}) => {
  const { getTableProps, getTableBodyProps, headerGroups, prepareRow, page, rows } = useTable(
    {
      columns: columns || [],
      data: data || [],
      initialState: {
        pageIndex: currentPage - 1,
        ...initialState
      },
      manualPagination: true,
      autoResetPage: false,
      pageCount: controlledPageCount
    },
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      if (!showSelection) return
      hooks.visibleColumns.push((columns) => [
        {
          id: 'selection',
          width: 35,
          Header: ({ getToggleAllRowsSelectedProps }) => <DatatableCheckbox {...getToggleAllRowsSelectedProps()} />,
          Cell: ({ row }) => {
            return <DatatableCheckbox {...row.getToggleRowSelectedProps()} />
          }
        },
        ...columns
      ])
    }
  )
  return (
    <div className="flex flex-col justify-between h-full">
      {/* <div className="flex justify-end mt-5 mb-3">
        <Input placeholder="Search Data" prepend={<MdSearch className="text-lg" />} className="pl-10" />
      </div> */}
      {rows.filter((item) => item.isSelected).length > 0 && (
        <div className="absolute top-[36px]  flex items-center px-3 py-2 space-x-2 text-sm border rounded-lg border-primary text-primary">
          <button onClick={() => deleteNotifications(rows.filter((item, id) => item.isSelected))}>Delete</button>
          {/* <MdDeleteOutline /> */}
        </div>
      )}
      {data?.length > 0 && (
        <div className="max-w-full overflow-x-auto border-2 rounded-lg border-dark">
          <table className={clsx('w-full', !showOverflow && 'overflow-hidden')} {...getTableProps()}>
            <thead className="text-white bg-dark">
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th
                      className="relative px-3 py-3 font-medium text-left border-2 border-dark cursor-pointer"
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      {...column.getHeaderProps({
                        style: { minWidth: column.minWidth, width: column.width }
                      })}>
                      <span>{column.render('Header')}</span>
                      {column.canSort && column.sortedIndex === 0 && (
                        <SorterIcon type={column.isSortedDesc ? 'desc' : 'asc'} />
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="table-row-bg" {...getTableBodyProps()}>
              {page.map((row: any, i: number) => {
                prepareRow(row)
                return (
                  <tr
                    key={i}
                    onClick={() => onRowClick && onRowClick(row)}
                    className="border-b-2 border-dark last:border-b-0"
                    style={{
                      cursor: onRowClick ? 'pointer' : 'default',
                      '&:hover': {
                        boxShadow: onRowClick && 'inset 0px 0px 3px rgba(0,0,0, .2)',
                        backgroundColor: onRowClick && 'rgba(0,0,0,.01) !important'
                      }
                    }}
                    {...row.getRowProps()}>
                    {row.cells.map((cell: any) => {
                      return (
                        <td className="relative px-3 py-2" {...cell.getCellProps()}>
                          {cell.render('Cell')}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      {loading && (
        <div className="flex justify-center my-5">
          <Loading />
        </div>
      )}
      {!loading && data?.length === 0 && <WarningAlert>No data yet.</WarningAlert>}

      {/* {pageOptions.length > 0 && (
        <ReactPaginate
          breakLabel="..."
          initialPage={pageIndex}
          className="flex items-center justify-center mt-5"
          pageLinkClassName="w-10 h-10 flex items-center justify-center"
          activeClassName="w-10 h-10 flex items-center justify-center bg-blue-400 text-white rounded-md"
          nextClassName="w-10 h-10 flex items-center justify-center"
          previousClassName="w-10 h-10 flex items-center justify-center"
          nextLabel={<ChevronRightIcon width={18} />}
          onPageChange={({ selected }) => {
            gotoPage(selected || 0)
            onPageChange && onPageChange(selected + 1)
          }}
          pageRangeDisplayed={5}
          pageCount={controlledPageCount || 0}
          previousLabel={<ChevronLeftIcon width={18} />}
        />
      )} */}
    </div>
  )
}

export { DataTable }
