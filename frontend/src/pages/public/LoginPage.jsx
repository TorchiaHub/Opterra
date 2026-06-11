import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={styles.page}>
      <div className={styles.gridPattern} />
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.logoWrapper}>
              <Icon name="sparkles" size={40} className={styles.logo} />
            </div>
            <h1 className={styles.title}>Welcome back</h1>
            <p className={styles.subtitle}>Sign in to your Opterra account</p>
          </div>

          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            <div className={styles.field}>
              <label className={styles.label}>
                <Icon name="mail" size={16} className={styles.labelIcon} />
                Email
              </label>
              <input
                type="email"
                required
                className={styles.input}
                placeholder="you@company.com"
              />
            </div>

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
                  placeholder="Enter your password"
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

            <div className={styles.options}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className={styles.checkboxInput}
                />
                <span className={styles.checkboxCheck}>
                  <Icon name="check" size={12} />
                </span>
                <span className={styles.checkboxLabel}>Remember me</span>
              </label>
              <Link to="/forgot-password" className={styles.forgotLink}>
                Forgot password?
              </Link>
            </div>

            <button type="submit" className={styles.submitBtn}>
              <Icon name="arrowRight" size={18} />
              Sign In
            </button>
          </form>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              Don't have an account?{' '}
              <Link to="/register" className={styles.footerLink}>
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
