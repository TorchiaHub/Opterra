import { Link } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.gridPattern} />
      <div className={styles.container}>
        <div className={styles.numberWrapper}>
          <span className={styles.number}>4</span>
          <div className={styles.iconCircle}>
            <Icon name="search" size={48} className={styles.icon} />
          </div>
          <span className={styles.number}>4</span>
        </div>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.description}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className={styles.backBtn}>
          <Icon name="arrowLeft" size={18} />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
