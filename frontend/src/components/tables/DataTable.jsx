import Icon from '../Icon'
import styles from './DataTable.module.css'

export function DataTable({ columns = [], data = [], onRowClick, emptyState, loading }) {
  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.loading}>
          <Icon name="refresh" size={24} className={styles.loadingIcon} />
          <span>Caricamento...</span>
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className={styles.wrapper}>
        {emptyState || (
          <div className={styles.empty}>
            <Icon name="inbox" size={24} />
            <span>Nessun dato disponibile</span>
          </div>
        )}
      </div>
    )
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
                {col.sortable && (
                  <span className={styles.sortIcon}>
                    <Icon name="sort" size={14} />
                  </span>
                )}
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
              style={{ animationDelay: `${rowIndex * 0.03}s` }}
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
