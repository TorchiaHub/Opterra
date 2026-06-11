import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import styles from './RegisterPage.module.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [companyName, setCompanyName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreed) {
      setError('Please agree to the Terms of Service');
      return;
    }

    setLoading(true);

    try {
      const slug = companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      await register({
        name: companyName,
        slug,
        firstName,
        lastName,
        email,
        password,
        country: 'IT',
      });

      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Registration failed';
      setError(msg);
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
            <h1 className={styles.title}>Create your account</h1>
            <p className={styles.subtitle}>Start your free trial today</p>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <Icon name="alertCircle" size={16} />
              <span>{error}</span>
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label}>
                <Icon name="building" size={16} className={styles.labelIcon} />
                Company Name
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className={styles.input}
                placeholder="Your company"
                disabled={loading}
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
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={styles.input}
                  placeholder="John"
                  disabled={loading}
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
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={styles.input}
                  placeholder="Doe"
                  disabled={loading}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                placeholder="john@company.com"
                disabled={loading}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.input}
                    placeholder="Min 8 characters"
                    disabled={loading}
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
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={styles.input}
                    placeholder="Repeat password"
                    disabled={loading}
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
                disabled={loading}
              />
              <span className={styles.checkboxCheck}>
                <Icon name="check" size={12} />
              </span>
              <span className={styles.checkboxLabel}>
                I agree to the <Link to="/terms" className={styles.termsLink}>Terms of Service</Link> and <Link to="/privacy" className={styles.termsLink}>Privacy Policy</Link>
              </span>
            </label>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (
                <Icon name="loader" size={18} className={styles.spinner} />
              ) : (
                <Icon name="arrowRight" size={18} />
              )}
              {loading ? 'Creating account...' : 'Create Account'}
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
      </div>
    </div>
  );
}
