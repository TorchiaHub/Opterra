import { Link } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import styles from './HomePage.module.css';

const features = [
  { icon: 'search', title: 'AI-Powered Search', description: 'Find the perfect tenders instantly with our intelligent matching engine.' },
  { icon: 'robot', title: 'Smart Automation', description: 'Automate repetitive tasks and focus on winning more contracts.' },
  { icon: 'shield', title: 'Secure & Compliant', description: 'Enterprise-grade security with full audit trails and compliance.' },
  { icon: 'globe', title: 'Global Coverage', description: 'Access tenders from across Europe and beyond in one platform.' },
  { icon: 'zap', title: 'Real-Time Alerts', description: 'Never miss an opportunity with instant notifications and alerts.' },
  { icon: 'layers', title: 'Advanced Analytics', description: 'Track performance, insights, and trends with powerful dashboards.' },
];

export default function HomePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroBackground} />
        <div className={styles.heroContent}>
          <div className={styles.logoFloat}>
            <Icon name="sparkles" size={64} className={styles.logoIcon} />
          </div>
          <h1 className={styles.heroTitle}>
            <span className={styles.gradientText}>Opterra</span>
            <br />
            <span className={styles.heroSubtitle}>AI-Powered Tender Intelligence</span>
          </h1>
          <p className={styles.heroDescription}>
            Discover, track, and win public tenders with the power of artificial intelligence.
            The modern platform built for procurement professionals.
          </p>
          <div className={styles.heroButtons}>
            <Link to="/register" className={styles.btnPrimary}>
              Get Started Free
              <Icon name="arrowRight" size={18} className={styles.btnIcon} />
            </Link>
            <Link to="/demo" className={styles.btnSecondary}>
              Request a Demo
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
            <h2 className={styles.featuresTitle}>Why Choose Opterra?</h2>
            <p className={styles.featuresSubtitle}>
              Everything you need to find and win the best public tenders
            </p>
          </div>
          <div className={styles.featuresGrid}>
            {features.map((f, i) => (
              <div
                key={f.title}
                className={styles.featureCard}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={styles.featureIcon}>
                  <Icon name={f.icon} size={28} />
                </div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <Icon name="sparkles" size={24} className={styles.footerLogo} />
              <span className={styles.footerBrandName}>Opterra</span>
            </div>
            <div className={styles.footerLinks}>
              <Link to="/features">Features</Link>
              <Link to="/pricing">Pricing</Link>
              <Link to="/demo">Demo</Link>
              <Link to="/login">Login</Link>
            </div>
            <p className={styles.footerCopy}>2026 Opterra. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
