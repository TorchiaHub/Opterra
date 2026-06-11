import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import Icon from '../../components/Icon.jsx';
import styles from './HomePage.module.css';

const featureKeys = [
  { icon: 'search', key: 'search' },
  { icon: 'robot', key: 'automation' },
  { icon: 'shield', key: 'security' },
  { icon: 'globe', key: 'coverage' },
  { icon: 'zap', key: 'alerts' },
  { icon: 'layers', key: 'analytics' },
];

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language);

  const handleLangToggle = () => {
    const next = i18n.language === 'it' ? 'en' : 'it';
    i18n.changeLanguage(next);
    setLang(next);
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <div className={styles.gridPattern} />
        </div>
        <button className={styles.langToggle} onClick={handleLangToggle}>
          {i18n.language === 'it' ? 'EN' : 'IT'}
        </button>
        <div className={styles.heroContent}>
          <div className={styles.logoFloat}>
            <img src="/opterra-logo.png" alt="Opterra" className={styles.logoImg} />
          </div>
          <h1 className={styles.heroTitle}>
            <span className={styles.heroBrand}>Opterra</span>
            <br />
            <span className={styles.heroSubtitle}>{t('public.home.heroSubtitle')}</span>
          </h1>
          <p className={styles.heroDescription}>
            {t('public.home.heroDescription')}
          </p>
          <div className={styles.heroButtons}>
            <Link to="/register" className={styles.btnPrimary}>
              {t('public.home.getStarted')}
              <Icon name="arrowRight" size={18} className={styles.btnIcon} />
            </Link>
            <Link to="/demo" className={styles.btnSecondary}>
              {t('public.home.requestDemo')}
              <Icon name="calendar" size={18} className={styles.btnIcon} />
            </Link>
          </div>
        </div>
        <div className={styles.heroScroll}>
          <div className={styles.scrollIndicator} />
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.container}>
          <div className={styles.featuresHeader}>
            <h2 className={styles.featuresTitle}>{t('public.home.whyChoose')}</h2>
            <p className={styles.featuresSubtitle}>
              {t('public.home.whyChooseSub')}
            </p>
          </div>
          <div className={styles.featuresGrid}>
            {featureKeys.map((f, i) => (
              <div
                key={f.key}
                className={styles.featureCard}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <span className={styles.featureNumber}>{String(i + 1).padStart(2, '0')}</span>
                <div className={styles.featureIcon}>
                  <Icon name={f.icon} size={28} />
                </div>
                <h3 className={styles.featureTitle}>{t(`public.home.features.${f.key}.title`)}</h3>
                <p className={styles.featureDesc}>{t(`public.home.features.${f.key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <img src="/opterra-logo.png" alt="Opterra" className={styles.footerLogo} />
              <span className={styles.footerBrandName}>Opterra</span>
            </div>
            <div className={styles.footerLinks}>
              <Link to="/features">{t('nav.features')}</Link>
              <Link to="/pricing">{t('nav.pricing')}</Link>
              <Link to="/demo">{t('nav.demo')}</Link>
              <Link to="/login">{t('nav.login')}</Link>
            </div>
            <p className={styles.footerCopy}>{t('public.home.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}