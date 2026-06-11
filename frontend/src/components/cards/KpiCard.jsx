import styles from './KpiCard.module.css'

export function KpiCard({ label, value, trend, trendLabel, footer }) {
  const trendClass = trend > 0 ? styles.trendUp : trend < 0 ? styles.trendDown : styles.trendNeutral
  const trendIcon = trend > 0 ? '↑' : trend < 0 ? '↓' : '→'

  return (
    <div className={styles.card}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      {(trend !== undefined || trendLabel) && (
        <span className={`${styles.trend} ${trendClass}`}>
          {trendIcon} {trendLabel || Math.abs(trend) + '%'}
        </span>
      )}
      {footer && <span className={styles.footer}>{footer}</span>}
    </div>
  )
}
