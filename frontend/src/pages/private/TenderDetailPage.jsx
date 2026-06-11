import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/layout/PageHeader/PageHeader'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs/Breadcrumbs'
import { SectionCard } from '../../components/cards/SectionCard'
import { StatusBadge } from '../../components/feedback/StatusBadge'
import { APP_ROUTES, TENDER_STATUS_LABELS, TENDER_STATUS_COLORS } from '../../utils/constants'
import { formatCurrency } from '../../utils/format'
import { formatDate } from '../../utils/date'
import styles from './TenderDetailPage.module.css'

const TABS = ['Overview', 'Checklist', 'Documenti', 'Task', 'AI Insights']

const mockTender = {
  id: 1,
  title: 'Fornitura software procurement',
  issuer: 'Comune di Milano',
  type: 'rfp',
  status: 'active',
  deadlineAt: '2026-07-12T10:00:00Z',
  valueAmount: 120000,
  description: 'Fornitura di un sistema software per la gestione del procurement e degli appalti pubblici.',
  referenceCode: 'BANDO-2026-001',
  createdAt: '2026-06-01T10:00:00Z',
}

export function TenderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className={styles.page}>
      <Breadcrumbs items={[
        { label: 'Workspace', to: APP_ROUTES.DASHBOARD },
        { label: 'Gare', to: APP_ROUTES.TENDERS },
        { label: mockTender.title },
      ]} />
      <PageHeader
        title={mockTender.title}
        subtitle={mockTender.issuer}
        actions={
          <StatusBadge
            label={TENDER_STATUS_LABELS[mockTender.status]}
            variant={TENDER_STATUS_COLORS[mockTender.status]}
          />
        }
      />

      <div className={styles.tabs}>
        {TABS.map((tab, i) => (
          <button
            key={i}
            className={`${styles.tab} ${i === activeTab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 0 && (
        <div className={styles.overview}>
          <SectionCard title="Dettagli gara">
            <div className={styles.infoGrid}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Codice</span>
                <span className={styles.infoValue}>{mockTender.referenceCode}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Ente banditore</span>
                <span className={styles.infoValue}>{mockTender.issuer}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Tipo</span>
                <span className={styles.infoValue}>{mockTender.type.toUpperCase()}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Valore</span>
                <span className={styles.infoValue}>{formatCurrency(mockTender.valueAmount)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Scadenza</span>
                <span className={styles.infoValue}>{formatDate(mockTender.deadlineAt)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Creata il</span>
                <span className={styles.infoValue}>{formatDate(mockTender.createdAt)}</span>
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Descrizione">
            <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
              {mockTender.description}
            </p>
          </SectionCard>
        </div>
      )}

      {activeTab !== 0 && (
        <SectionCard title={TABS[activeTab]}>
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)' }}>
            Contenuto in arrivo...
          </div>
        </SectionCard>
      )}
    </div>
  )
}
