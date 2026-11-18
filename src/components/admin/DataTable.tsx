import { useEffect, useState, type ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  /** 'num' — вирівнювання праворуч для чисел/сум. */
  className?: string;
}

interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string | number;
  footer?: ReactNode;
  rowClassName?: (row: T) => string;
  /** Якщо задано — клієнтська пагінація з такою кількістю рядків на сторінці. */
  pageSize?: number;
}

/** Проста типізована таблиця з декларативним описом колонок та опційною пагінацією. */
export function DataTable<T>({ rows, columns, rowKey, footer, rowClassName, pageSize }: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const pageCount = pageSize ? Math.max(1, Math.ceil(rows.length / pageSize)) : 1;

  // Після зміни фільтрів повертаємось на першу сторінку. Залежність — довжина, а не сам
  // масив: батьки можуть створювати новий масив на кожному рендері.
  useEffect(() => setPage(0), [rows.length]);

  const current = Math.min(page, pageCount - 1);
  const visible = pageSize ? rows.slice(current * pageSize, (current + 1) * pageSize) : rows;

  return (
    <>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={c.className}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={rowKey(row)} className={rowClassName?.(row)}>
                {columns.map((c) => (
                  <td key={c.key} className={c.className}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {footer && <tfoot>{footer}</tfoot>}
        </table>
      </div>
      {pageSize && pageCount > 1 && (
        <nav className="pager" aria-label="Сторінки таблиці">
          <span className="pager__info">
            {current * pageSize + 1}–{Math.min((current + 1) * pageSize, rows.length)} з {rows.length}
          </span>
          <button
            type="button"
            className="btn btn--outline btn--sm"
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
          >
            ← Назад
          </button>
          <span className="pager__page">
            {current + 1} / {pageCount}
          </span>
          <button
            type="button"
            className="btn btn--outline btn--sm"
            disabled={current >= pageCount - 1}
            onClick={() => setPage(current + 1)}
          >
            Далі →
          </button>
        </nav>
      )}
    </>
  );
}
