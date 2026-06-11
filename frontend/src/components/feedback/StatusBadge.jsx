import styles from './StatusBadge.module.css'

const VARIANT_MAP = {
  success: styles.success,
  warning: styles.warning,
  danger: styles.danger,
  info: styles.info,
  pending: styles.pending,
  neutral: styles.neutral,
}

export function StatusBadge({ label, variant = 'neutral', showDot = true }) {
  return (
    <span className={`${styles.badge} ${VARIANT_MAP[variant] || styles.neutral}`}>
      {showDot && <span className={styles.dot} />}
      {label}
    </span>
  )
}
