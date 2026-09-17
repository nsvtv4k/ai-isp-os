import React from 'react';

export interface Column<T> {
  header: React.ReactNode;
  accessor?: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  isLoading,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full py-12 text-center text-slate-400 text-sm animate-pulse bg-[#111827] border border-slate-800 rounded-2xl">
        Loading records...
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto border border-slate-800 rounded-2xl bg-[#111827] shadow-xl">
      <table className="w-full text-left text-sm text-slate-200">
        <thead className="bg-[#0B0F19] border-b border-slate-800 text-xs font-bold text-sky-400 uppercase tracking-wider font-mono">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className={`px-5 py-4 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-12 text-center text-slate-500 font-mono">
                No matching records found.
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick && onRowClick(item)}
                className={`hover:bg-slate-800/60 transition ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((col, idx) => (
                  <td key={idx} className={`px-5 py-4 ${col.className || ''}`}>
                    {typeof col.accessor === 'function'
                      ? col.accessor(item)
                      : col.accessor
                      ? (item[col.accessor] as React.ReactNode)
                      : null}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
