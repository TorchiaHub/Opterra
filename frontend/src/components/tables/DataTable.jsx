import styles from './DataTable.module.css'

export function DataTable({ columns = [], data = [], onRowClick, emptyState, loading }) {
  if (loading) {
    return <div className={styles.wrapper}><div style={{ padding: 'var(--space-16)', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)' }}>Caricamento...</div></div>
  }

  if (!data || data.length === 0) {
    return <div className={styles.wrapper}>{emptyState || <div style={{ padding: 'var(--space-16)', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)' }}>Nessun dato disponibile</div>}</div>
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className={`${styles.th} ${col.sortable ? styles.thSortable : ''}`}
                style={col.width ? { width: col.width } : {}}
                onClick={col.sortable ? col.onSort : undefined}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              className={`${styles.row} ${onRowClick ? styles.clickable : ''}`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} className={styles.td}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
