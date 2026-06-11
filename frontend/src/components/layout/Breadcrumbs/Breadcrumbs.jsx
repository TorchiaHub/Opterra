import { Link } from 'react-router-dom';
import Icon from '../../Icon';
import styles from './Breadcrumbs.module.css';

export function Breadcrumbs({ items = [] }) {
  if (items.length === 0) return null;

  return (
    <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
      <Link to="/" className={styles.crumb}>
        <Icon name="home" size={14} />
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} className={styles.wrapper}>
            <Icon name="chevronRight" size={12} className={styles.sep} />
            {isLast ? (
              <span className={styles.current}>{item.label}</span>
            ) : (
              <Link to={item.to} className={styles.crumb}>{item.label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
