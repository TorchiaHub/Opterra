import { useContext } from 'react'
import { UIContext } from '../../context/UIContext'
import Icon from '../Icon'
import styles from './Toast.module.css'

const TYPE_ICONS = {
  success: 'checkCircle',
  error: 'circleX',
  warning: 'circleAlert',
  info: 'info',
}

const TYPE_COLORS = {
  success: styles.success,
  error: styles.error,
  warning: styles.warning,
  info: styles.info,
}

export function ToastContainer() {
  const { toasts, removeToast } = useContext(UIContext)

  if (toasts.length === 0) return null

  return (
    <div className={styles.container}>
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className={`${styles.toast} ${TYPE_COLORS[toast.type] || styles.info}`}
        >
          <span className={styles.icon}>
            <Icon name={TYPE_ICONS[toast.type] || TYPE_ICONS.info} size={20} />
          </span>
          <span className={styles.message}>{toast.message}</span>
          <button className={styles.close} onClick={() => removeToast(toast.id)}>
            <Icon name="close" size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
