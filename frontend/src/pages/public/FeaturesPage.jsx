import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '../../components/Icon.jsx';
import styles from './FeaturesPage.module.css';

const featureKeys = [
  { icon: 'search', key: 'search' },
  { icon: 'robot', key: 'automation' },
  { icon: 'shield', key: 'security' },
  { icon: 'globe', key: 'coverage' },
  { icon: 'zap', key: 'alerts' },
  { icon: 'layers', key: 'analytics' },
  { icon: 'users', key: 'collaboration' },
  { icon: 'chat', key: 'assistant' },
  { icon: 'calendar', key: 'deadlines' },
];

export default function FeaturesPage() {
  const { t } = useTranslation();
  const gridRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const cards = gridRef.current?.querySelectorAll(`.${styles.featureCard}`);
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.gridPattern} />
        <div className={styles.container}>
          <h1 className={styles.heroTitle}>{t('public.features.heading')}</h1>
          <p className={styles.heroSubtitle}>
            {t('public.features.subtitle')}
          </p>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.container}>
          <div ref={gridRef} className={styles.featuresGrid}>
            {featureKeys.map((f, i) => (
              <div key={f.key} className={styles.featureCard} style={{ transitionDelay: `${i * 0.05}s` }}>
                <span className={styles.featureNumber}>{String(i + 1).padStart(2, '0')}</span>
                <div className={styles.featureIcon}>
                  <Icon name={f.icon} size={32} />
                </div>
                <h3 className={styles.featureTitle}>{t(`public.features.items.${f.key}.title`)}</h3>
                <p className={styles.featureDesc}>{t(`public.features.items.${f.key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.container}>
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>{t('public.features.ctaHeading')}</h2>
            <p className={styles.ctaDesc}>{t('public.features.ctaDescription')}</p>
            <div className={styles.ctaButtons}>
              <Link to="/register" className={styles.ctaBtnPrimary}>
                {t('public.features.startTrial')}
                <Icon name="arrowRight" size={18} className={styles.ctaIcon} />
              </Link>
              <Link to="/demo" className={styles.ctaBtnSecondary}>
                {t('public.features.requestDemo')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}