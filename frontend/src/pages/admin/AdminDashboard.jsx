import { PageHeader } from '../../components/layout/PageHeader/PageHeader'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs/Breadcrumbs'
import { KpiCard } from '../../components/cards/KpiCard'
import { SectionCard } from '../../components/cards/SectionCard'
import { APP_ROUTES } from '../../utils/constants'
import styles from './AdminDashboard.module.css'

export function AdminDashboard() {
  return (
    <div className={styles.page}>
      <Breadcrumbs items={[
        { label: 'Admin', to: APP_ROUTES.ADMIN_DASHBOARD },
        { label: 'Dashboard' },
      ]} />
      <PageHeader title="Admin Dashboard" subtitle="Panoramica globale del sistema" />

      <div className={styles.stats}>
        <KpiCard label="Tenant Attivi" value="24" trend={3} trendLabel="questo mese" />
        <KpiCard label="Utenti Totali" value="187" trend={12} trendLabel="questo mese" />
        <KpiCard label="Gare Create" value="456" trend={8} trendLabel="questo mese" />
        <KpiCard label="Revenue MRR" value="€ 18.2K" trend={15} trendLabel="crescita" />
      </div>

      <SectionCard title="Attività recenti">
        <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)' }}>
          Log attività in caricamento...
        </div>
      </SectionCard>
    </div>
  )
}
