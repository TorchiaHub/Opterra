import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '../../components/Icon.jsx';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  const { t } = useTranslation();

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
        <h1 className={styles.title}>{t('public.notFound.title')}</h1>
        <p className={styles.description}>
          {t('public.notFound.description')}
        </p>
        <Link to="/" className={styles.backBtn}>
          <Icon name="arrowLeft" size={18} />
          {t('public.notFound.backHome')}
        </Link>
      </div>
    </div>
  );
}