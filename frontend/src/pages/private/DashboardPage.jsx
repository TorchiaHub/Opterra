import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/layout/PageHeader/PageHeader'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs/Breadcrumbs'
import { KpiCard } from '../../components/cards/KpiCard'
import { SectionCard } from '../../components/cards/SectionCard'
import { Loader } from '../../components/feedback/Loader'
import { ErrorState } from '../../components/feedback/ErrorState'
import { StatusBadge } from '../../components/feedback/StatusBadge'
import { APP_ROUTES, TENDER_STATUS_LABELS, TENDER_STATUS_COLORS } from '../../utils/constants'
import { formatCurrency } from '../../utils/format'
import { formatRelative, formatDate } from '../../utils/date'
import styles from './DashboardPage.module.css'

const kpiData = [
  { label: 'Gare Attive', value: '12', trend: 2, trendLabel: '+2 questa settimana' },
  { label: 'In Scadenza', value: '4', trend: -1, trendLabel: 'urgenti' },
  { label: 'Valore Totale', value: '€ 1.2M', trend: 8, trendLabel: 'vs mese scorso' },
  { label: 'Task Assegnati', value: '23', trend: 5, trendLabel: 'da completare' },
]

const recentTenders = [
  { id: 1, title: 'Fornitura software procurement', issuer: 'Comune di Milano', status: 'active', deadlineAt: '2026-07-12T10:00:00Z', valueAmount: 120000 },
  { id: 2, title: 'Servizi di consulenza ICT', issuer: 'Regione Lazio', status: 'in_review', deadlineAt: '2026-06-28T10:00:00Z', valueAmount: 85000 },
  { id: 3, title: 'Manutenzione impianti', issuer: 'ASL Roma', status: 'draft', deadlineAt: '2026-08-01T10:00:00Z', valueAmount: 200000 },
  { id: 4, title: 'Fornitura arredi ufficio', issuer: 'Comune di Torino', status: 'won', deadlineAt: '2026-05-15T10:00:00Z', valueAmount: 45000 },
]

export function DashboardPage() {
  const navigate = useNavigate()
  const [loading] = useState(false)

  if (loading) return <Loader label="Caricamento dashboard..." />

  return (
    <div className={styles.page}>
      <Breadcrumbs items={[
        { label: 'Workspace', to: APP_ROUTES.DASHBOARD },
        { label: 'Dashboard' },
      ]} />
      <PageHeader title="Dashboard" subtitle="Panoramica del tuo workspace gare" />

      <div className={styles.kpiGrid}>
        {kpiData.map((kpi, i) => (
          <KpiCard key={i} {...kpi} />
        ))}
      </div>

      <div className={styles.grid}>
        <SectionCard title="Gare in scadenza" noPadding>
          <div className={styles.list}>
            {recentTenders.map(tender => (
              <div
                key={tender.id}
                className={styles.listItem}
                onClick={() => navigate(`/app/tenders/${tender.id}`)}
              >
                <div className={styles.listInfo}>
                  <span className={styles.listTitle}>{tender.title}</span>
                  <span className={styles.listMeta}>{tender.issuer}</span>
                </div>
                <div className={styles.listRight}>
                  <StatusBadge
                    label={TENDER_STATUS_LABELS[tender.status]}
                    variant={TENDER_STATUS_COLORS[tender.status]}
                  />
                  <div className={styles.listDate}>{formatRelative(tender.deadlineAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Attività recenti" noPadding>
          <div style={{ padding: 'var(--space-5)', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)' }}>
            Nessuna attività recente
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
