import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { TextInput } from '../../components/forms/TextInput'
import { SubmitButton } from '../../components/forms/SubmitButton'
import { APP_ROUTES } from '../../utils/constants'
import styles from './RegisterPage.module.css'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    companyName: '', firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Le password non coincidono')
      setLoading(false)
      return
    }
    try {
      await register({
        companyName: form.companyName,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      })
      navigate(APP_ROUTES.DASHBOARD)
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Errore durante la registrazione')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.brand}>
            <img src="/opterra-logo.png" alt="Opterra" className={styles.logo} />
            <span className={styles.brandName}>TenderFlow</span>
            <p className={styles.brandSub}>Crea il tuo workspace aziendale</p>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <form className={styles.form} onSubmit={handleSubmit}>
            <TextInput
              label="Nome azienda"
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              placeholder="Azienda S.p.A."
              required
            />
            <div className={styles.row}>
              <TextInput
                label="Nome"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Mario"
                required
              />
              <TextInput
                label="Cognome"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Rossi"
                required
              />
            </div>
            <TextInput
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="mario.rossi@azienda.it"
              required
            />
            <div className={styles.row}>
              <TextInput
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 8 caratteri"
                required
              />
              <TextInput
                label="Conferma password"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Ripeti password"
                required
              />
            </div>
            <div className={styles.submitBtn}>
              <SubmitButton loading={loading} variant="primary">
                Registra azienda
              </SubmitButton>
            </div>
          </form>

          <div className={styles.footer}>
            Hai già un account?{' '}
            <Link to={APP_ROUTES.LOGIN} className={styles.link}>Accedi</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
