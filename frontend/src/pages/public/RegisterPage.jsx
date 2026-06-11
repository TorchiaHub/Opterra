import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../../components/Icon.jsx';
import styles from './RegisterPage.module.css';

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Le password non corrispondono.');
      return;
    }
    setLoading(true);
    try {
      const slug = form.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        + '-' + Date.now().toString(36);

      await register({
        name: form.companyName,
        slug,
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        country: 'IT',
      });
      navigate('/app/dashboard');
    } catch (err) {
      setError(err?.response?.data?.error?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={styles.gridPattern} />
        <div className={styles.container}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>
              <Icon name="checkCircle" size={64} />
            </div>
            <h2 className={styles.successTitle}>{t('public.register.successTitle')}</h2>
            <p className={styles.successText}>
              {t('public.register.successMessage')}
            </p>
            <Link to="/login" className={styles.successBtn}>
              <Icon name="arrowRight" size={18} />
              {t('public.register.goToLogin')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.gridPattern} />
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.logoWrapper}>
              <Icon name="sparkles" size={40} className={styles.logo} />
            </div>
            <h1 className={styles.title}>{t('public.register.heading')}</h1>
            <p className={styles.subtitle}>{t('public.register.subtitle')}</p>
          </div>

          {error && (
            <div className={styles.errorMessage}>{error}</div>
          )}

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label}>
                <Icon name="building" size={16} className={styles.labelIcon} />
                {t('public.register.companyName')}
              </label>
              <input
                name="companyName"
                type="text"
                required
                className={styles.input}
                placeholder={t('public.register.companyPlaceholder')}
                value={form.companyName}
                onChange={handleChange}
              />
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>
                  <Icon name="user" size={16} className={styles.labelIcon} />
                  {t('public.register.firstName')}
                </label>
                <input
                  name="firstName"
                  type="text"
                  required
                  className={styles.input}
                  placeholder={t('public.register.firstNamePlaceholder')}
                  value={form.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>
                  <Icon name="user" size={16} className={styles.labelIcon} />
                  {t('public.register.lastName')}
                </label>
                <input
                  name="lastName"
                  type="text"
                  required
                  className={styles.input}
                  placeholder={t('public.register.lastNamePlaceholder')}
                  value={form.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                <Icon name="mail" size={16} className={styles.labelIcon} />
                {t('public.register.email')}
              </label>
              <input
                name="email"
                type="email"
                required
                className={styles.input}
                placeholder={t('public.register.emailPlaceholder')}
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>
                  <Icon name="lock" size={16} className={styles.labelIcon} />
                  {t('public.register.password')}
                </label>
                <div className={styles.passwordWrapper}>
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className={styles.input}
                    placeholder={t('public.register.passwordPlaceholder')}
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
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
                  {t('public.register.confirmPassword')}
                </label>
                <div className={styles.passwordWrapper}>
                  <input
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    required
                    className={styles.input}
                    placeholder={t('public.register.confirmPasswordPlaceholder')}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
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
                {t('public.register.agreeToTerms', {
                  termsLink: <Link to="/terms" className={styles.termsLink}>{t('public.register.termsOfService')}</Link>,
                  privacyLink: <Link to="/privacy" className={styles.termsLink}>{t('public.register.privacyPolicy')}</Link>,
                })}
              </span>
            </label>

            <button type="submit" className={styles.submitBtn} disabled={loading || !agreed}>
              <Icon name="arrowRight" size={18} />
              {loading ? t('common.loading') : t('public.register.submit')}
            </button>
          </form>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              {t('public.register.hasAccount')}{' '}
              <Link to="/login" className={styles.footerLink}>
                {t('public.register.signIn')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}