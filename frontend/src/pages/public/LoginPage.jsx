import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../../components/Icon.jsx';
import { APP_ROUTES } from '../../utils/constants.js';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || APP_ROUTES.DASHBOARD;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = await login(email, password);
      navigate(userData?.role === 'superadmin' ? APP_ROUTES.ADMIN_DASHBOARD : from, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.gridPattern} />
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.logoWrapper}>
              <Icon name="sparkles" size={40} className={styles.logo} />
            </div>
            <h1 className={styles.title}>{t('public.login.heading')}</h1>
            <p className={styles.subtitle}>{t('public.login.subtitle')}</p>
          </div>

          {error && (
            <div className={styles.errorMessage}>{error}</div>
          )}

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label}>
                <Icon name="mail" size={16} className={styles.labelIcon} />
                {t('public.login.email')}
              </label>
              <input
                type="email"
                required
                className={styles.input}
                placeholder={t('public.login.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                <Icon name="lock" size={16} className={styles.labelIcon} />
                {t('public.login.password')}
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className={styles.input}
                  placeholder={t('public.login.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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
                <span className={styles.checkboxLabel}>{t('public.login.rememberMe')}</span>
              </label>
              <Link to="/forgot-password" className={styles.forgotLink}>
                {t('public.login.forgotPassword')}
              </Link>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              <Icon name="arrowRight" size={18} />
              {loading ? t('common.loading') : t('public.login.submit')}
            </button>
          </form>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              {t('public.login.noAccount')}{' '}
              <Link to="/register" className={styles.footerLink}>
                {t('public.login.createAccount')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}