import styles from './Loader.module.css'

export function Loader({ label = 'Caricamento...', size = 'default' }) {
  return (
    <div className={`${styles.wrapper} ${size === 'small' ? styles.small : ''}`}>
      <div className={styles.spinner} />
      {label && <span className={styles.label}>{label}</span>}
    </div>
  )
}
