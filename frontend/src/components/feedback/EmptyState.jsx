import Icon from '../Icon'
import styles from './EmptyState.module.css'

export function EmptyState({ title, message, action, icon = 'inbox' }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.icon}>
        <Icon name={icon} size={48} />
      </div>
      <h3 className={styles.title}>{title}</h3>
      {message && <p className={styles.message}>{message}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
