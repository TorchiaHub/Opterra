import { useState } from 'react'
import { PageHeader } from '../../components/layout/PageHeader/PageHeader'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs/Breadcrumbs'
import { DataTable } from '../../components/tables/DataTable'
import { SectionCard } from '../../components/cards/SectionCard'
import { StatusBadge } from '../../components/feedback/StatusBadge'
import { EmptyState } from '../../components/feedback/EmptyState'
import Icon from '../../components/Icon'
import { APP_ROUTES } from '../../utils/constants'
import styles from './SubscriptionsPage.module.css'

const mockPlans = [
  { id: 1, name: 'Starter', price: 29, users: 3, tenders: 10, features: ['Base', 'Email'], status: 'active', description: 'Per piccoli team' },
  { id: 2, name: 'Professional', price: 99, users: 15, tenders: 50, features: ['Base', 'Email', 'AI', 'Report'], status: 'active', description: 'Per team in crescita' },
  { id: 3, name: 'Enterprise', price: 299, users: 50, tenders: 200, features: ['Tutto', 'API', 'Supporto'], status: 'active', description: 'Per grandi aziende' },
  { id: 4, name: 'Free Trial', price: 0, users: 1, tenders: 3, features: ['Base'], status: 'disabled', description: 'Prova gratuita 14gg' },
]

export function SubscriptionsPage() {
  const [plans, setPlans] = useState(mockPlans)
  const [loading] = useState(false)

  const toggleStatus = (id) => {
    setPlans(prev => prev.map(p =>
      p.id === id ? { ...p, status: p.status === 'active' ? 'disabled' : 'active' } : p
    ))
  }

  const columns = [
    { label: 'Piano', render: row => (
      <div className={styles.planCell}>
        <span className={styles.planIcon}>
          <Icon name="layers" size={16} />
        </span>
        <div className={styles.planInfo}>
          <span className={styles.planName}>{row.name}</span>
          <span className={styles.planDesc}>{row.description}</span>
        </div>
      </div>
    )},
    { label: 'Prezzo', render: row => (
      <span className={styles.price}>
        {row.price === 0 ? 'Gratuito' : `€${row.price}/mese`}
      </span>
    )},
    { label: 'Utenti', render: row => (
      <span className={styles.countCell}>
        <Icon name="users" size={14} />
        {row.users}
      </span>
    )},
    { label: 'Gare', render: row => (
      <span className={styles.countCell}>
        <Icon name="tenders" size={14} />
        {row.tenders}
      </span>
    )},
    { label: 'Funzionalità', render: row => (
      <div className={styles.features}>
        {row.features.map((f, i) => (
          <span key={i} className={styles.featureTag}>
            <Icon name="check" size={10} />
            {f}
          </span>
        ))}
      </div>
    )},
    { label: 'Stato', render: row => (
      <StatusBadge
        label={row.status === 'active' ? 'Attivo' : 'Disabilitato'}
        variant={row.status === 'active' ? 'success' : 'neutral'}
      />
    )},
    { label: 'Azioni', render: row => (
      <div className={styles.actionsCell}>
        <button className={styles.actionBtn} title="Modifica piano">
          <Icon name="edit" size={16} />
        </button>
        <button
          className={`${styles.toggleBtn} ${row.status === 'active' ? styles.toggleActive : styles.toggleDisabled}`}
          onClick={() => toggleStatus(row.id)}
          title={row.status === 'active' ? 'Disabilita' : 'Attiva'}
        >
          <Icon name={row.status === 'active' ? 'circleCheck' : 'circleX'} size={16} />
          <span>{row.status === 'active' ? 'Attivo' : 'Disabilitato'}</span>
        </button>
      </div>
    )},
  ]

  return (
    <div className={styles.page}>
      <Breadcrumbs items={[
        { label: 'Admin', to: APP_ROUTES.ADMIN_DASHBOARD },
        { label: 'Subscription' },
      ]} />
      <PageHeader
        title="Subscription"
        subtitle="Gestione dei piani e dei prezzi"
        actions={
          <button className={styles.primaryBtn}>
            <Icon name="plus" size={16} />
            <span>Nuovo Piano</span>
          </button>
        }
      />

      <SectionCard title="Piani disponibili" noPadding>
        {loading ? (
          <div className={styles.loadingBox}>
            <Icon name="refresh" size={32} className={styles.loadingIcon} />
            <span>Caricamento piani...</span>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={plans}
            emptyState={
              <EmptyState
                title="Nessun piano disponibile"
                message="Crea un nuovo piano per iniziare."
                icon="inbox"
              />
            }
          />
        )}
      </SectionCard>
    </div>
  )
}
