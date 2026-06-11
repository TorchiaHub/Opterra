import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import styles from './RegisterPage.module.css';

export default function RegisterPage() {
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {!submitted ? (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.logoWrapper}>
                <Icon name="sparkles" size={40} className={styles.logo} />
              </div>
              <h1 className={styles.title}>Create your account</h1>
              <p className={styles.subtitle}>Start your free trial today</p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label className={styles.label}>
                  <Icon name="building" size={16} className={styles.labelIcon} />
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  className={styles.input}
                  placeholder="Your company"
                />
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    <Icon name="user" size={16} className={styles.labelIcon} />
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    className={styles.input}
                    placeholder="John"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>
                    <Icon name="user" size={16} className={styles.labelIcon} />
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    className={styles.input}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  <Icon name="mail" size={16} className={styles.labelIcon} />
                  Email
                </label>
                <input
                  type="email"
                  required
                  className={styles.input}
                  placeholder="john@company.com"
                />
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    <Icon name="lock" size={16} className={styles.labelIcon} />
                    Password
                  </label>
                  <div className={styles.passwordWrapper}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      className={styles.input}
                      placeholder="Min 8 characters"
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      <Icon name="eye" size={18} />
                    </button>
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>
                    <Icon name="lock" size={16} className={styles.labelIcon} />
                    Confirm
                  </label>
                  <div className={styles.passwordWrapper}>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      required
                      className={styles.input}
                      placeholder="Repeat password"
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowConfirm(!showConfirm)}
                      tabIndex={-1}
                    >
                      <Icon name="eye" size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className={styles.checkboxInput}
                  required
                />
                <span className={styles.checkboxCheck}>
                  <Icon name="check" size={12} />
                </span>
                <span className={styles.checkboxLabel}>
                  I agree to the <Link to="/terms" className={styles.termsLink}>Terms of Service</Link> and <Link to="/privacy" className={styles.termsLink}>Privacy Policy</Link>
                </span>
              </label>

              <button type="submit" className={styles.submitBtn}>
                <Icon name="arrowRight" size={18} />
                Create Account
              </button>
            </form>

            <div className={styles.footer}>
              <p className={styles.footerText}>
                Already have an account?{' '}
                <Link to="/login" className={styles.footerLink}>
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <div className={styles.successCard}>
            <div className={styles.successIcon}>
              <Icon name="checkCircle" size={64} />
            </div>
            <h2 className={styles.successTitle}>Account Created!</h2>
            <p className={styles.successText}>
              Welcome to Opterra. Check your email to verify your account and get started.
            </p>
            <Link to="/login" className={styles.successBtn}>
              <Icon name="arrowRight" size={18} />
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
