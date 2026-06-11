import Icon from '../Icon'
import styles from './Pagination.module.css'

export function Pagination({ page = 1, totalPages = 1, total, onPageChange }) {
  if (totalPages <= 1 && !total) return null

  const pages = []
  const start = Math.max(1, page - 1)
  const end = Math.min(totalPages, page + 1)
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return (
    <div className={styles.pagination}>
      <span className={styles.info}>
        {total ? `${total} risultati` : ''}
      </span>
      {totalPages > 1 && (
        <div className={styles.buttons}>
          <button
            className={styles.btn}
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <Icon name="arrowLeft" size={16} />
          </button>
          {pages.map(p => (
            <button
              key={p}
              className={`${styles.btn} ${p === page ? styles.btnActive : ''}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          ))}
          <button
            className={styles.btn}
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <Icon name="arrowRight" size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
