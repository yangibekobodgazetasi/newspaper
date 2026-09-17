import type { ReactNode } from 'react';
import styles from './DataTable.module.scss';

export interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  keyField: keyof T;
  emptyText?: string;
}

/** Har qanday ro'yxat sahifasida qayta ishlatiladigan generic jadval — DRY. */
export default function DataTable<T>({ columns, rows, keyField, emptyText = "Ma'lumot topilmadi" }: DataTableProps<T>) {
  if (rows.length === 0) {
    return <p className={styles.empty}>{emptyText}</p>;
  }

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.header} style={{ width: col.width }}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={String(row[keyField])}>
              {columns.map((col) => (
                <td key={col.header}>{col.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
