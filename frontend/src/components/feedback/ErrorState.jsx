import styles from './ErrorState.module.css'

export function ErrorState({ title = 'Errore di caricamento', message, onRetry }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.icon}>⚠️</div>
      <h3 className={styles.title}>{title}</h3>
      {message && <p className={styles.message}>{message}</p>}
      {onRetry && (
        <button className={styles.retryBtn} onClick={onRetry}>
          Riprova
        </button>
      )}
    </div>
  )
}
