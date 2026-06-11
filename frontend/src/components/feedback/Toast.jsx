import { useContext } from 'react'
import { UIContext } from '../../context/UIContext'
import styles from './Toast.module.css'

const TYPE_ICONS = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
}

export function ToastContainer() {
  const { toasts, removeToast } = useContext(UIContext)

  if (toasts.length === 0) return null

  return (
    <div className={styles.container}>
      {toasts.map(toast => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.type] || styles.info}`}>
          <span className={styles.icon}>{TYPE_ICONS[toast.type] || TYPE_ICONS.info}</span>
          <span className={styles.message}>{toast.message}</span>
          <button className={styles.close} onClick={() => removeToast(toast.id)}>×</button>
        </div>
      ))}
    </div>
  )
}
