import Icon from '../Icon'
import styles from './KpiCard.module.css'

export function KpiCard({ label, value, trend, trendLabel, icon, footer }) {
  const trendClass = trend > 0 ? styles.trendUp : trend < 0 ? styles.trendDown : styles.trendNeutral
  const trendIcon = trend > 0 ? 'trendingUp' : trend < 0 ? 'trendingDown' : 'arrowRight'

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        {icon && (
          <span className={styles.icon}>
            <Icon name={icon} size={20} />
          </span>
        )}
      </div>
      <span className={styles.value}>{value}</span>
      {(trend !== undefined || trendLabel) && (
        <span className={`${styles.trend} ${trendClass}`}>
          <Icon name={trendIcon} size={14} />
          {trendLabel || Math.abs(trend) + '%'}
        </span>
      )}
      {footer && <span className={styles.footer}>{footer}</span>}
    </div>
  )
}
