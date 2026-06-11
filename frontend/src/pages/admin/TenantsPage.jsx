import { useState } from 'react'
import { PageHeader } from '../../components/layout/PageHeader/PageHeader'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs/Breadcrumbs'
import { DataTable } from '../../components/tables/DataTable'
import { FilterBar } from '../../components/tables/FilterBar'
import { StatusBadge } from '../../components/feedback/StatusBadge'
import { EmptyState } from '../../components/feedback/EmptyState'
import { SubmitButton } from '../../components/forms/SubmitButton'
import Icon from '../../components/Icon'
import { APP_ROUTES } from '../../utils/constants'
import { formatDate } from '../../utils/date'
import styles from './TenantsPage.module.css'

const mockTenants = [
  { id: 1, name: 'Acme S.p.A.', email: 'admin@acme.it', users: 12, tenders: 8, status: 'active', createdAt: '2026-01-15' },
  { id: 2, name: 'Beta Srl', email: 'info@beta.it', users: 5, tenders: 3, status: 'active', createdAt: '2026-03-01' },
  { id: 3, name: 'Gamma Consulting', email: 'admin@gamma.it', users: 8, tenders: 15, status: 'disabled', createdAt: '2026-02-20' },
  { id: 4, name: 'Delta Tech', email: 'info@delta.it', users: 22, tenders: 31, status: 'active', createdAt: '2025-11-05' },
  { id: 5, name: 'Epsilon Group', email: 'admin@epsilon.it', users: 3, tenders: 1, status: 'disabled', createdAt: '2026-04-12' },
  { id: 6, name: 'Zeta Engineering', email: 'contact@zeta.it', users: 17, tenders: 12, status: 'active', createdAt: '2025-09-18' },
]

export function TenantsPage() {
  const [tenants, setTenants] = useState(mockTenants)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const toggleStatus = (id) => {
    setTenants(prev => prev.map(t =>
      t.id === id ? { ...t, status: t.status === 'active' ? 'disabled' : 'active' } : t
    ))
  }

  const filtered = tenants.filter(t => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter ? t.status === statusFilter : true
    return matchSearch && matchStatus
  })

  const columns = [
    { label: 'Azienda', render: row => (
      <div className={styles.tenantCell}>
        <span className={styles.tenantIcon}>
          <Icon name="building" size={16} />
        </span>
        <div className={styles.tenantInfo}>
          <span className={styles.tenantName}>{row.name}</span>
          <span className={styles.tenantEmail}>{row.email}</span>
        </div>
      </div>
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
    { label: 'Stato', render: row => (
      <StatusBadge
        label={row.status === 'active' ? 'Attivo' : 'Disabilitato'}
        variant={row.status === 'active' ? 'success' : 'neutral'}
      />
    )},
    { label: 'Registrato il', render: row => formatDate(row.createdAt) },
    { label: 'Azioni', render: row => (
      <div className={styles.actionsCell}>
        <button className={styles.actionBtn} type="button" title="Modifica">
          <Icon name="edit" size={16} />
        </button>
        <button
          className={`${styles.toggleBtn} ${row.status === 'active' ? styles.toggleActive : styles.toggleDisabled}`}
          type="button"
          onClick={() => toggleStatus(row.id)}
          title={row.status === 'active' ? 'Disabilita' : 'Attiva'}
        >
          <Icon name={row.status === 'active' ? 'circleCheck' : 'circleX'} size={16} />
          <span>{row.status === 'active' ? 'Attivo' : 'Disabilitato'}</span>
        </button>
      </div>
    )},
  ]

  function handleClearFilters() {
    setSearch('')
    setStatusFilter('')
  }

  return (
    <div className={styles.page}>
      <Breadcrumbs items={[
        { label: 'Admin', to: APP_ROUTES.ADMIN_DASHBOARD },
        { label: 'Tenant' },
      ]} />
      <PageHeader
        title="Tenant"
        subtitle="Gestione di tutti i tenant della piattaforma"
        actions={
          <SubmitButton variant="primary" onClick={() => {}}>
            <Icon name="plus" size={16} />
            <span>Nuovo Tenant</span>
          </SubmitButton>
        }
      />

      <div className={styles.toolbar}>
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          onClear={handleClearFilters}
          searchPlaceholder="Cerca azienda o email..."
          filters={[
            {
              placeholder: 'Stato',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { label: 'Attivo', value: 'active' },
                { label: 'Disabilitato', value: 'disabled' },
              ],
            },
          ]}
        />
      </div>

      <div className={styles.tableWrapper}>
        <DataTable
          columns={columns}
          data={filtered}
          emptyState={
            <EmptyState
              title="Nessun tenant trovato"
              message="Prova a modificare i filtri di ricerca."
              icon="search"
            />
          }
        />
      </div>
    </div>
  )
}
