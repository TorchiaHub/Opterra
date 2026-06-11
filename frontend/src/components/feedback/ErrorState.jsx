import Icon from '../Icon'
import styles from './ErrorState.module.css'

export function ErrorState({ title = 'Errore di caricamento', message, onRetry }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.icon}>
        <Icon name="alert" size={48} />
      </div>
      <h3 className={styles.title}>{title}</h3>
      {message && <p className={styles.message}>{message}</p>}
      {onRetry && (
        <button className={styles.retryBtn} onClick={onRetry}>
          <Icon name="refresh" size={16} />
          <span>Riprova</span>
        </button>
      )}
    </div>
  )
}
