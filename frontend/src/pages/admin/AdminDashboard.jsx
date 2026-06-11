import { PageHeader } from '../../components/layout/PageHeader/PageHeader'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs/Breadcrumbs'
import { KpiCard } from '../../components/cards/KpiCard'
import { SectionCard } from '../../components/cards/SectionCard'
import { DataTable } from '../../components/tables/DataTable'
import { EmptyState } from '../../components/feedback/EmptyState'
import { Loader } from '../../components/feedback/Loader'
import Icon from '../../components/Icon'
import { APP_ROUTES } from '../../utils/constants'
import { formatDate } from '../../utils/date'
import styles from './AdminDashboard.module.css'

const mockKpi = [
  { label: 'Tenant Attivi', value: '24', trend: 3, trendLabel: 'questo mese', icon: 'building' },
  { label: 'Utenti Totali', value: '187', trend: 12, trendLabel: 'questo mese', icon: 'users' },
  { label: 'Gare Create', value: '456', trend: 8, trendLabel: 'questo mese', icon: 'tenders' },
  { label: 'Revenue MRR', value: '€ 18.2K', trend: 15, trendLabel: 'crescita', icon: 'briefcase' },
]

const mockActivity = [
  { id: 1, user: 'Marco Rossi', action: 'Ha creato una nuova gara', tenant: 'Acme S.p.A.', timestamp: '2026-06-11T09:30:00' },
  { id: 2, user: 'Anna Bianchi', action: 'Ha aggiornato il profilo', tenant: 'Beta Srl', timestamp: '2026-06-11T08:45:00' },
  { id: 3, user: 'System', action: 'Backup completato', tenant: '—', timestamp: '2026-06-10T23:00:00' },
  { id: 4, user: 'Luca Verdi', action: 'Ha inviato una proposta', tenant: 'Gamma Consulting', timestamp: '2026-06-10T16:20:00' },
  { id: 5, user: 'Giulia Neri', action: 'Ha abilitato un nuovo utente', tenant: 'Acme S.p.A.', timestamp: '2026-06-10T11:10:00' },
  { id: 6, user: 'Paolo Gialli', action: 'Ha modificato un piano', tenant: 'Beta Srl', timestamp: '2026-06-09T14:55:00' },
]

const activityColumns = [
  { label: 'Utente', render: row => (
    <div className={styles.userCell}>
      <span className={styles.userAvatar}>
        <Icon name="user" size={14} />
      </span>
      {row.user}
    </div>
  )},
  { label: 'Azione', key: 'action' },
  { label: 'Tenant', render: row => (
    <span className={row.tenant === '—' ? styles.muted : ''}>{row.tenant}</span>
  )},
  { label: 'Data', render: row => formatDate(row.timestamp) },
]

export function AdminDashboard() {
  const loading = false

  return (
    <div className={styles.page}>
      <Breadcrumbs items={[
        { label: 'Admin', to: APP_ROUTES.ADMIN_DASHBOARD },
        { label: 'Dashboard' },
      ]} />
      <PageHeader
        title="Admin Dashboard"
        subtitle="Panoramica globale del sistema"
        actions={
          <button className={styles.actionBtn}>
            <Icon name="refresh" size={16} />
            <span>Aggiorna</span>
          </button>
        }
      />

      <div className={styles.stats}>
        {mockKpi.map((kpi, i) => (
          <div key={i} className={styles.kpiWrapper} style={{ animationDelay: `${i * 0.06}s` }}>
            <KpiCard {...kpi} />
          </div>
        ))}
      </div>

      <div className={styles.grid}>
        <SectionCard
          title="Attività recenti"
          actions={
            <button className={styles.linkBtn}>
              <span>Visualizza tutte</span>
              <Icon name="arrowRight" size={14} />
            </button>
          }
        >
          {loading ? (
            <Loader label="Caricamento attività..." />
          ) : (
            <DataTable
              columns={activityColumns}
              data={mockActivity}
              emptyState={
                <EmptyState
                  title="Nessuna attività"
                  message="Non sono state registrate attività recenti."
                  icon="inbox"
                />
              }
            />
          )}
        </SectionCard>

        <SectionCard
          title="Distribuzione"
          actions={
            <button className={styles.linkBtn}>
              <span>Dettagli</span>
              <Icon name="arrowRight" size={14} />
            </button>
          }
        >
          <div className={styles.chartPlaceholder}>
            <div className={styles.chartIcon}>
              <Icon name="layout" size={48} />
            </div>
            <p className={styles.chartLabel}>Grafici in arrivo</p>
            <p className={styles.chartSub}>I widget di analisi saranno disponibili a breve.</p>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
