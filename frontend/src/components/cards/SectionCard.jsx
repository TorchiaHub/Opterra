import styles from './SectionCard.module.css'

export function SectionCard({ title, actions, children, noPadding = false }) {
  return (
    <div className={styles.card}>
      {title && (
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className={`${styles.body} ${noPadding ? styles.bodyNoPadding : ''}`}>
        {children}
      </div>
    </div>
  )
}
