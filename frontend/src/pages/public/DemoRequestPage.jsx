import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import styles from './DemoRequestPage.module.css';

export default function DemoRequestPage() {
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
              <h1 className={styles.title}>Request a Demo</h1>
              <p className={styles.subtitle}>See how Opterra can transform your tender process</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    <Icon name="building" size={16} className={styles.labelIcon} />
                    Company Name
                  </label>
                  <input
                    name="company"
                    type="text"
                    required
                    value={form.company}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Your company"
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    <Icon name="user" size={16} className={styles.labelIcon} />
                    First Name
                  </label>
                  <input
                    name="firstName"
                    type="text"
                    required
                    value={form.firstName}
                    onChange={handleChange}
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
                    name="lastName"
                    type="text"
                    required
                    value={form.lastName}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    <Icon name="mail" size={16} className={styles.labelIcon} />
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="john@company.com"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>
                    <Icon name="phone" size={16} className={styles.labelIcon} />
                    Phone
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  <Icon name="chat" size={16} className={styles.labelIcon} />
                  Message
                </label>
                <textarea
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  className={styles.textarea}
                  placeholder="Tell us about your needs..."
                />
              </div>

              <button type="submit" className={styles.submitBtn}>
                <Icon name="send" size={18} />
                Submit Request
              </button>
            </form>
          </div>
        ) : (
          <div className={styles.successCard}>
            <div className={styles.successIcon}>
              <Icon name="checkCircle" size={64} />
            </div>
            <h2 className={styles.successTitle}>Request Submitted!</h2>
            <p className={styles.successText}>
              Thank you for your interest. Our team will contact you shortly to schedule your demo.
            </p>
            <Link to="/" className={styles.successBtn}>
              <Icon name="arrowLeft" size={18} />
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
