import type { Column } from '../types';

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  loading?: boolean;
  emptyMessage?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  emptyMessage = 'Tidak ada data.',
  pagination,
}: Props<T>) {
  const totalPages = pagination
    ? Math.max(1, Math.ceil(pagination.total / pagination.limit))
    : 1;

  return (
    <div>
      <div
        className={`overflow-x-auto transition-opacity ${loading ? 'opacity-50' : ''}`}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted">
              {columns.map((col) => (
                <th key={col.key} className={`pb-3 pr-4 ${col.className ?? ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)} className="border-t border-line">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-3 pr-4 align-middle ${col.className ?? ''}`}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <p className="py-8 text-center text-sm text-muted">
          {loading ? 'Memuat...' : emptyMessage}
        </p>
      )}

      {pagination && pagination.total > 0 && (
        <div className="mt-5 flex items-center justify-between text-sm">
          <button
            className="btn btn-soft"
            disabled={pagination.page <= 1 || loading}
            onClick={() => pagination.onPageChange(pagination.page - 1)}
          >
            Sebelumnya
          </button>
          <span className="text-muted">
            Halaman {pagination.page} dari {totalPages} &middot;{' '}
            {pagination.total} data
          </span>
          <button
            className="btn btn-soft"
            disabled={pagination.page >= totalPages || loading}
            onClick={() => pagination.onPageChange(pagination.page + 1)}
          >
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
}