import React, { useState, useMemo } from 'react';
import { cn } from '@/utils/cn';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Search,
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { EmptyState } from './EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';

export interface ColumnDef<T> {
  id: string;
  header: string;
  accessor?: (row: T) => any;
  cell?: (props: { row: T; value: any }) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onRowClick?: (row: T) => void;
  searchPlaceholder?: string;
  filterComponent?: React.ReactNode;
  bulkActions?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  pageSize?: number;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  onRowClick,
  searchPlaceholder = 'Search table...',
  filterComponent,
  bulkActions,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search query or filters.',
  pageSize = 10,
  className,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumnId, setSortColumnId] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((row) => {
      return columns.some((col) => {
        const val = col.accessor ? col.accessor(row) : (row as any)[col.id];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(term);
      });
    });
  }, [data, searchTerm, columns]);

  const sortedData = useMemo(() => {
    if (!sortColumnId) return filteredData;
    const col = columns.find((c) => c.id === sortColumnId);
    if (!col) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = col.accessor ? col.accessor(a) : (a as any)[sortColumnId];
      const bVal = col.accessor ? col.accessor(b) : (b as any)[sortColumnId];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const comp = aVal < bVal ? -1 : 1;
      return sortDirection === 'asc' ? comp : -comp;
    });
  }, [filteredData, sortColumnId, sortDirection, columns]);

  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (colId: string) => {
    if (sortColumnId === colId) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortColumnId(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumnId(colId);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      const allIds = paginatedData.map(keyExtractor);
      onSelectionChange(Array.from(new Set([...selectedIds, ...allIds])));
    } else {
      const pageIds = new Set(paginatedData.map(keyExtractor));
      onSelectionChange(selectedIds.filter((id) => !pageIds.has(id)));
    }
  };

  const isAllSelected =
    paginatedData.length > 0 &&
    paginatedData.every((row) => selectedIds.includes(keyExtractor(row)));

  const handleRowSelect = (id: string, checked: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter((item) => item !== id));
    }
  };

  return (
    <div className={cn('skeuo-raised-2 bg-white rounded-md border border-neutral-200 overflow-hidden', className)}>
      {/* Header controls bar */}
      <div className="p-fib-13 border-b border-neutral-200 bg-neutral-50/70 flex flex-wrap items-center justify-between gap-fib-8">
        <div className="flex items-center gap-fib-8 flex-1 min-w-[240px] max-w-md">
          <Input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            onClear={() => setSearchTerm('')}
            placeholder={searchPlaceholder}
            leftIcon={<Search className="w-4 h-4 text-neutral-400" />}
            className="bg-white"
          />
          {filterComponent && (
            <div className="flex items-center gap-fib-5 shrink-0">{filterComponent}</div>
          )}
        </div>

        {selectedIds.length > 0 && bulkActions && (
          <div className="flex items-center gap-fib-8 bg-blue-50 border border-blue-200 px-fib-8 py-fib-3 rounded-md text-xs font-semibold text-blue-800">
            <span>{selectedIds.length} selected</span>
            <div className="h-3 w-[1px] bg-blue-300 mx-1" />
            {bulkActions}
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-neutral-100/75 border-b border-neutral-200 select-none">
              {selectable && (
                <th className="p-fib-8 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.id}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && handleSort(col.id)}
                  className={cn(
                    'px-fib-13 py-fib-8 font-bold uppercase tracking-wider text-[10px] text-neutral-600',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right',
                    col.sortable && 'cursor-pointer hover:bg-neutral-200/60 transition-colors'
                  )}
                >
                  <div className={cn('inline-flex items-center gap-fib-5', col.align === 'right' && 'justify-end')}>
                    <span>{col.header}</span>
                    {col.sortable && (
                      <ArrowUpDown
                        className={cn(
                          'w-3 h-3 text-neutral-400',
                          sortColumnId === col.id && 'text-blue-600 font-bold'
                        )}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, idx) => (
                <tr key={idx}>
                  <td colSpan={columns.length + (selectable ? 1 : 0)} className="p-0">
                    <Skeleton variant="table-row" />
                  </td>
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="p-fib-21">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => {
                const id = keyExtractor(row);
                const isSelected = selectedIds.includes(id);

                return (
                  <tr
                    key={id}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={cn(
                      'transition-colors duration-100 hover:bg-neutral-50/90 group',
                      isSelected && 'bg-blue-50/60 hover:bg-blue-50',
                      onRowClick && 'cursor-pointer'
                    )}
                  >
                    {selectable && (
                      <td className="p-fib-8 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleRowSelect(id, e.target.checked, e as any)}
                          className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                    )}
                    {columns.map((col) => {
                      const val = col.accessor ? col.accessor(row) : (row as any)[col.id];
                      return (
                        <td
                          key={col.id}
                          className={cn(
                            'px-fib-13 py-fib-8 text-neutral-700 font-normal',
                            col.align === 'center' && 'text-center',
                            col.align === 'right' && 'text-right tabular-nums'
                          )}
                        >
                          {col.cell ? col.cell({ row, value: val }) : String(val ?? '—')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Pagination */}
      {!isLoading && sortedData.length > 0 && (
        <div className="p-fib-8 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs text-neutral-600">
          <div className="text-[11px] tabular-nums">
            Showing <span className="font-semibold text-neutral-900">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-semibold text-neutral-900">
              {Math.min(currentPage * pageSize, sortedData.length)}
            </span>{' '}
            of <span className="font-semibold text-neutral-900">{sortedData.length}</span> entries
          </div>

          <div className="flex items-center gap-fib-3">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-neutral-200 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-neutral-200 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-semibold tabular-nums">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1 rounded hover:bg-neutral-200 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1 rounded hover:bg-neutral-200 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
