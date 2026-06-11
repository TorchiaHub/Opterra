import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '../../components/Icon.jsx';
import styles from './DemoRequestPage.module.css';

export default function DemoRequestPage() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    company: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className={styles.page}>
      <div className={styles.gridPattern} />
      <div className={styles.container}>
        {!submitted ? (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.headerIcon}>
                <Icon name="calendar" size={32} />
              </div>
              <h1 className={styles.title}>{t('public.demo.heading')}</h1>
              <p className={styles.subtitle}>{t('public.demo.subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    <Icon name="building" size={16} className={styles.labelIcon} />
                    {t('public.demo.companyName')}
                  </label>
                  <input
                    name="company"
                    type="text"
                    required
                    value={form.company}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder={t('public.demo.companyPlaceholder')}
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    <Icon name="user" size={16} className={styles.labelIcon} />
                    {t('public.demo.firstName')}
                  </label>
                  <input
                    name="firstName"
                    type="text"
                    required
                    value={form.firstName}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder={t('public.demo.firstNamePlaceholder')}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>
                    <Icon name="user" size={16} className={styles.labelIcon} />
                    {t('public.demo.lastName')}
                  </label>
                  <input
                    name="lastName"
                    type="text"
                    required
                    value={form.lastName}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder={t('public.demo.lastNamePlaceholder')}
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    <Icon name="mail" size={16} className={styles.labelIcon} />
                    {t('public.demo.email')}
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder={t('public.demo.emailPlaceholder')}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>
                    <Icon name="phone" size={16} className={styles.labelIcon} />
                    {t('public.demo.phone')}
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder={t('public.demo.phonePlaceholder')}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  <Icon name="chat" size={16} className={styles.labelIcon} />
                  {t('public.demo.message')}
                </label>
                <textarea
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  className={styles.textarea}
                  placeholder={t('public.demo.messagePlaceholder')}
                />
              </div>

              <button type="submit" className={styles.submitBtn}>
                <Icon name="send" size={18} />
                {t('public.demo.submit')}
              </button>
            </form>
          </div>
        ) : (
          <div className={styles.successCard}>
            <div className={styles.successIcon}>
              <Icon name="checkCircle" size={64} />
            </div>
            <h2 className={styles.successTitle}>{t('public.demo.successTitle')}</h2>
            <p className={styles.successText}>
              {t('public.demo.successMessage')}
            </p>
            <Link to="/" className={styles.successBtn}>
              <Icon name="arrowLeft" size={18} />
              {t('public.demo.backHome')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}