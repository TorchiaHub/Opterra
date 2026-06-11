import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { TextInput } from '../../components/forms/TextInput'
import { SubmitButton } from '../../components/forms/SubmitButton'
import { APP_ROUTES } from '../../utils/constants'
import styles from './LoginPage.module.css'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
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
    try {
      await login(form.email, form.password)
      navigate(APP_ROUTES.DASHBOARD)
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Email o password non validi')
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
            <p className={styles.brandSub}>Accedi al tuo workspace</p>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <form className={styles.form} onSubmit={handleSubmit}>
            <TextInput
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="nome@azienda.it"
              required
            />
            <TextInput
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
            <div className={styles.submitBtn}>
              <SubmitButton loading={loading} variant="primary">
                Accedi
              </SubmitButton>
            </div>
          </form>

          <div className={styles.footer}>
            Non hai un account?{' '}
            <Link to={APP_ROUTES.REGISTER} className={styles.link}>Registra la tua azienda</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
