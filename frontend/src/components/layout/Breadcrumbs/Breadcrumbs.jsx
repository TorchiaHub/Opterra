import { Link } from 'react-router-dom'
import Icon from '../../Icon'
import styles from './Breadcrumbs.module.css'

export function Breadcrumbs({ items = [] }) {
  return (
    <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <span key={index} className={styles.item}>
            {index > 0 && (
              <span className={styles.separator}>
                <Icon name="chevronRight" size={14} />
              </span>
            )}
            {isLast ? (
              <span className={styles.current}>{item.label}</span>
            ) : (
              <Link to={item.to} className={styles.link}>{item.label}</Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
