import styles from './EmptyState.module.css'

export function EmptyState({ icon = '📭', title, message, action }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.icon}>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      {message && <p className={styles.message}>{message}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
