import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import styles from './FeaturesPage.module.css';

const features = [
  {
    icon: 'search',
    title: 'AI-Powered Search',
    description: 'Our intelligent search engine understands your business needs and matches you with the most relevant tenders automatically.',
  },
  {
    icon: 'robot',
    title: 'Smart Automation',
    description: 'Automate repetitive tasks, document generation, and deadline tracking so you can focus on strategy.',
  },
  {
    icon: 'shield',
    title: 'Enterprise Security',
    description: 'Bank-grade encryption, GDPR compliance, and full audit trails keep your data safe and your processes compliant.',
  },
  {
    icon: 'globe',
    title: 'Global Coverage',
    description: 'Access public tenders from all EU member states, plus UK, Switzerland, and beyond — all in one unified platform.',
  },
  {
    icon: 'zap',
    title: 'Real-Time Alerts',
    description: 'Get instant notifications when new tenders match your criteria, so you never miss an opportunity.',
  },
  {
    icon: 'layers',
    title: 'Advanced Analytics',
    description: 'Track win rates, monitor competitor activity, and gain actionable insights with beautiful dashboards.',
  },
  {
    icon: 'users',
    title: 'Team Collaboration',
    description: 'Work together with your team on tender responses, assign tasks, and track progress in real-time.',
  },
  {
    icon: 'chat',
    title: 'AI Assistant',
    description: 'Get help drafting responses, analyzing requirements, and preparing documents with our built-in AI assistant.',
  },
  {
    icon: 'calendar',
    title: 'Deadline Management',
    description: 'Never miss a deadline with automated reminders, calendar integration, and progress tracking.',
  },
];

export default function FeaturesPage() {
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
          <h1 className={styles.heroTitle}>Features</h1>
          <p className={styles.heroSubtitle}>
            Everything you need to find, track, and win public tenders
          </p>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.container}>
          <div ref={gridRef} className={styles.featuresGrid}>
            {features.map((f, i) => (
              <div key={f.title} className={styles.featureCard} style={{ transitionDelay: `${i * 0.05}s` }}>
                <span className={styles.featureNumber}>{String(i + 1).padStart(2, '0')}</span>
                <div className={styles.featureIcon}>
                  <Icon name={f.icon} size={32} />
                </div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.container}>
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>Ready to get started?</h2>
            <p className={styles.ctaDesc}>Join thousands of companies using Opterra to win more tenders.</p>
            <div className={styles.ctaButtons}>
              <Link to="/register" className={styles.ctaBtnPrimary}>
                Start Free Trial
                <Icon name="arrowRight" size={18} className={styles.ctaIcon} />
              </Link>
              <Link to="/demo" className={styles.ctaBtnSecondary}>
                Request Demo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
