import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { APP_ROUTES } from '../../utils/constants'
import styles from './HomePage.module.css'

const features = [
  { icon: '📋', title: 'Gestione Gare', text: 'Centralizza tutte le gare, RFP e RFQ in un unico workspace condiviso con il tuo team.' },
  { icon: '✅', title: 'Checklist Intelligenti', text: 'Traccia ogni requisito con checklist collaborative, scadenze e assegnazione automatica.' },
  { icon: '📄', title: 'Documenti & Versioni', text: 'Carica, organizza e versiona i documenti di gara con drag-and-drop e anteprime.' },
  { icon: '🤖', title: 'AI Integrata', text: 'Estrai requisiti, analizza compliance, genera summary e bozze con AI specializzata.' },
  { icon: '💬', title: 'Chatbot Operativo', text: 'Un assistente conversazionale che esegue azioni, crea task e risponde su ogni gara.' },
  { icon: '🔍', title: 'Scopri Bandi', text: 'Ricevi bandi da fonti pubbliche con scoring automatico di rilevanza e salva con un click.' },
]

export function HomePage() {
  const { isAuthenticated } = useAuth()

  return (
    <div>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <img src="/opterra-logo.png" alt="Opterra" className={styles.heroLogo} />
          <h1 className={styles.heroTitle}>
            Il workspace <span className={styles.heroAccent}>intelligente</span> per chi vince gare
          </h1>
          <p className={styles.heroText}>
            TenderFlow unisce gestione documentale, checklist, task e AI in un'unica piattaforma
            SaaS pensata per aziende che partecipano a bandi e gare d'appalto.
          </p>
          <div className={styles.heroActions}>
            {isAuthenticated ? (
              <Link to={APP_ROUTES.DASHBOARD} className={styles.btnPrimary}>
                Vai alla Dashboard
              </Link>
            ) : (
              <>
                <Link to={APP_ROUTES.REGISTER} className={styles.btnPrimary}>
                  Inizia gratis
                </Link>
                <Link to={APP_ROUTES.LOGIN} className={styles.btnOutline}>
                  Accedi
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Tutto ciò che serve per gestire le gare</h2>
        <div className={styles.features}>
          {features.map((f, i) => (
            <div key={i} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureText}>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        © {new Date().getFullYear()} Opterra — TenderFlow. Tutti i diritti riservati.
      </footer>
    </div>
  )
}
