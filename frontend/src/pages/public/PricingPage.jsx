import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import styles from './PricingPage.module.css';

const plans = [
  {
    name: 'Basic',
    price: '29',
    period: 'per month',
    description: 'Perfect for small teams getting started',
    features: [
      'Up to 5 team members',
      '500 tender searches/month',
      'Basic email alerts',
      'Standard support',
      'Export to PDF',
      'Basic analytics',
    ],
    cta: 'Start Basic',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '79',
    period: 'per month',
    description: 'For growing teams that need more power',
    features: [
      'Up to 25 team members',
      'Unlimited tender searches',
      'Advanced AI alerts',
      'Priority support',
      'Export to PDF & Excel',
      'Advanced analytics',
      'Team collaboration',
      'AI response assistant',
    ],
    cta: 'Start Pro',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: '199',
    period: 'per month',
    description: 'For organizations with advanced needs',
    features: [
      'Unlimited team members',
      'Unlimited tender searches',
      'Custom AI workflows',
      'Dedicated account manager',
      'Full API access',
      'Custom integrations',
      'SSO & advanced security',
      'Custom training',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export default function PricingPage() {
  const [hoveredPlan, setHoveredPlan] = useState(null);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.gridPattern} />
        <div className={styles.container}>
          <h1 className={styles.heroTitle}>Simple, transparent pricing</h1>
          <p className={styles.heroSubtitle}>
            Choose the plan that fits your team. No hidden fees, cancel anytime.
          </p>
        </div>
      </section>

      <section className={styles.pricing}>
        <div className={styles.container}>
          <div className={styles.plansGrid}>
            {plans.map((plan, i) => (
              <div
                key={plan.name}
                className={`${styles.planCard} ${plan.highlighted ? styles.highlighted : ''} ${hoveredPlan === i ? styles.lifted : ''}`}
                onMouseEnter={() => setHoveredPlan(i)}
                onMouseLeave={() => setHoveredPlan(null)}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                {plan.highlighted && (
                  <div className={styles.popularBadge}>
                    <Icon name="star" size={14} />
                    Most Popular
                  </div>
                )}
                <h3 className={styles.planName}>{plan.name}</h3>
                <div className={styles.planPrice}>
                  <span className={styles.currency}>EUR</span>
                  <span className={styles.amount}>{plan.price}</span>
                  <span className={styles.period}>/{plan.period}</span>
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
                  to={plan.name === 'Enterprise' ? '/demo' : '/register'}
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
