import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '../../components/Icon.jsx';
import styles from './PricingPage.module.css';

const planKeys = ['basic', 'pro', 'enterprise'];

export default function PricingPage() {
  const { t } = useTranslation();
  const [hoveredPlan, setHoveredPlan] = useState(null);

  const plans = planKeys.map((key, i) => ({
    key,
    name: t(`public.pricing.${key}.name`),
    price: t(`public.pricing.${key}.price`),
    description: t(`public.pricing.${key}.description`),
    features: Array.from({ length: key === 'basic' ? 6 : key === 'pro' ? 8 : 8 }, (_, j) => t(`public.pricing.${key}.features.${j}`)),
    cta: t(`public.pricing.${key}.cta`),
    highlighted: key === 'pro',
  }));

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.gridPattern} />
        <div className={styles.container}>
          <h1 className={styles.heroTitle}>{t('public.pricing.heading')}</h1>
          <p className={styles.heroSubtitle}>
            {t('public.pricing.subtitle')}
          </p>
        </div>
      </section>

      <section className={styles.pricing}>
        <div className={styles.container}>
          <div className={styles.plansGrid}>
            {plans.map((plan, i) => (
              <div
                key={plan.key}
                className={`${styles.planCard} ${plan.highlighted ? styles.highlighted : ''} ${hoveredPlan === i ? styles.lifted : ''}`}
                onMouseEnter={() => setHoveredPlan(i)}
                onMouseLeave={() => setHoveredPlan(null)}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                {plan.highlighted && (
                  <div className={styles.popularBadge}>
                    <Icon name="star" size={14} />
                    {t('public.pricing.popularBadge')}
                  </div>
                )}
                <h3 className={styles.planName}>{plan.name}</h3>
                <div className={styles.planPrice}>
                  <span className={styles.currency}>EUR</span>
                  <span className={styles.amount}>{plan.price}</span>
                  <span className={styles.period}>/{t('public.pricing.perMonth')}</span>
                </div>
                <p className={styles.planDescription}>{plan.description}</p>
                <ul className={styles.planFeatures}>
                  {plan.features.map((feature) => (
                    <li key={feature} className={styles.planFeature}>
                      <Icon name="checkCircle" size={18} className={styles.checkIcon} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.key === 'enterprise' ? '/demo' : '/register'}
                  className={`${styles.planCta} ${plan.highlighted ? styles.ctaPrimary : styles.ctaSecondary}`}
                >
                  {plan.cta}
                  <Icon name="arrowRight" size={16} className={styles.ctaIcon} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}