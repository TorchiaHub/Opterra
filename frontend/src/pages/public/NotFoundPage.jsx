import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { APP_ROUTES } from '../../utils/constants'
import styles from './NotFoundPage.module.css'

export function NotFoundPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className={styles.page}>
      <div className={styles.code}>404</div>
      <h1 className={styles.title}>Pagina non trovata</h1>
      <p className={styles.message}>La pagina che stai cercando non esiste o è stata spostata.</p>
      <Link
        to={isAuthenticated ? APP_ROUTES.DASHBOARD : APP_ROUTES.HOME}
        className={styles.link}
      >
        Torna alla home
      </Link>
    </div>
  )
}
