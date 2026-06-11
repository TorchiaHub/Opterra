import Icon from '../Icon'
import styles from './Loader.module.css'

export function Loader({ label = 'Caricamento...', size = 'default' }) {
  return (
    <div className={`${styles.wrapper} ${size === 'small' ? styles.small : ''}`}>
      <div className={styles.spinner}>
        <Icon name="refresh" size={size === 'small' ? 16 : 24} className={styles.spinnerIcon} />
      </div>
      {label && <span className={styles.label}>{label}</span>}
    </div>
  )
}
