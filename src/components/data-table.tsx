'use client'

import * as React from 'react'
import {
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  globalFilter?: string
  onGlobalFilterChange?: (value: string) => void
  onRowClick?: (row: TData) => void
  pageSize?: number
  columnVisibility?: VisibilityState
  onColumnVisibilityChange?: React.Dispatch<React.SetStateAction<VisibilityState>>
  rowSelection?: RowSelectionState
  onRowSelectionChange?: React.Dispatch<React.SetStateAction<RowSelectionState>>
  getRowId?: (row: TData) => string
  emptyState?: React.ReactNode
}

export function DataTable<TData>({
  columns,
  data,
  globalFilter,
  onGlobalFilterChange,
  onRowClick,
  pageSize = 10,
  columnVisibility,
  onColumnVisibilityChange,
  rowSelection,
  onRowSelectionChange,
  getRowId,
  emptyState,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      columnVisibility,
      rowSelection: rowSelection ?? {},
    },
    getRowId,
    enableRowSelection: !!onRowSelectionChange,
    onSortingChange: setSorting,
    onGlobalFilterChange,
    onColumnVisibilityChange,
    onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  })

  const rows = table.getRowModel().rows

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-line">
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sorted = header.column.getIsSorted()
                  return (
                    <th
                      key={header.id}
                      className="whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-ink-faint"
                    >
                      {header.isPlaceholder ? null : (
                        <button
                          type="button"
                          disabled={!canSort}
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            'inline-flex items-center gap-1.5',
                            canSort && 'cursor-pointer hover:text-ink',
                          )}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort &&
                            (sorted === 'asc' ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : sorted === 'desc' ? (
                              <ArrowDown className="h-3 w-3" />
                            ) : (
                              <ChevronsUpDown className="h-3 w-3 opacity-40" />
                            ))}
                        </button>
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={table.getAllLeafColumns().length}>
                  {emptyState ?? (
                    <div className="px-4 py-12 text-center text-[13.5px] text-ink-muted">
                      No results found.
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={cn(
                    'border-b border-line-soft transition-colors last:border-0',
                    onRowClick && 'cursor-pointer hover:bg-line-soft/60',
                    row.getIsSelected() && 'bg-emerald-tint/50',
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 align-middle text-[13.5px] text-ink">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between border-t border-line px-4 py-3">
          <span className="text-[12.5px] text-ink-muted">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} ·{' '}
            {table.getFilteredRowModel().rows.length} rows
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
